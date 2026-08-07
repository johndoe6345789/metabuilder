#include "DockerClient.hpp"
#include "../util.hpp"

#include <curl/curl.h>
#include <json/json.h>

#include <sstream>
#include <stdexcept>

namespace dockerterminal {

namespace {

size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

Json::Value parseJson(const std::string& text) {
    Json::Value out;
    Json::CharReaderBuilder b;
    std::string errs;
    std::istringstream in(text);
    if (!Json::parseFromStream(b, in, &out, &errs))
        throw std::runtime_error("invalid JSON from Docker API: " + errs);
    return out;
}

std::string jsonText(const Json::Value& v) {
    Json::StreamWriterBuilder b;
    b["indentation"] = "";
    return Json::writeString(b, v);
}

struct CurlHandle {
    CURL* curl;
    CurlHandle() : curl(curl_easy_init()) {
        if (!curl)
            throw std::runtime_error("curl_easy_init failed");
    }
    ~CurlHandle() { curl_easy_cleanup(curl); }
    CurlHandle(const CurlHandle&) = delete;
    CurlHandle& operator=(const CurlHandle&) = delete;
};

// Performs one HTTP request against the Docker Engine API over its Unix
// socket. `body` is sent as a JSON POST body when non-null.
std::string dockerRequest(const std::string& socketPath, const std::string& path,
                           const std::string* jsonBody = nullptr) {
    CurlHandle h;
    std::string url = "http://localhost" + path;
    std::string response;
    struct curl_slist* headers = nullptr;

    curl_easy_setopt(h.curl, CURLOPT_UNIX_SOCKET_PATH, socketPath.c_str());
    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 30L);

    if (jsonBody) {
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(h.curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(h.curl, CURLOPT_POSTFIELDS, jsonBody->c_str());
        curl_easy_setopt(h.curl, CURLOPT_POSTFIELDSIZE, static_cast<long>(jsonBody->size()));
    }

    CURLcode res = curl_easy_perform(h.curl);
    if (headers)
        curl_slist_free_all(headers);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("Docker API request failed: ") +
                                  curl_easy_strerror(res));

    long status = 0;
    curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &status);
    if (status >= 400)
        throw std::runtime_error("Docker API returned HTTP " + std::to_string(status) +
                                  ": " + response);

    return response;
}

} // namespace

DockerClient::DockerClient(std::string socketPath) : socketPath_(std::move(socketPath)) {}

std::vector<ContainerInfo> DockerClient::listContainers() {
    auto body = dockerRequest(socketPath_, "/containers/json?all=true");
    Json::Value arr = parseJson(body);

    std::vector<ContainerInfo> out;
    for (const auto& item : arr) {
        ContainerInfo c;
        std::string fullId = item.get("Id", "").asString();
        c.id = fullId.substr(0, 12);

        auto names = item["Names"];
        if (names.isArray() && !names.empty()) {
            std::string n = names[0].asString();
            c.name = (!n.empty() && n[0] == '/') ? n.substr(1) : n;
        }

        std::string image = item.get("Image", "unknown").asString();
        // Untagged images show up as a raw digest here; the old Flask
        // handler's `image.tags[0] if tags else 'unknown'` had the same
        // fallback for this case.
        c.image = image.rfind("sha256:", 0) == 0 ? "unknown" : image;

        c.status = item.get("State", "").asString();
        c.createdEpochSeconds = item.get("Created", 0).asInt64();
        out.push_back(std::move(c));
    }
    return out;
}

RunResult DockerClient::runInContainer(const std::string& containerId,
                                        const std::string& shellLine) {
    auto argv = splitCommand(shellLine.empty() ? "/bin/sh" : shellLine);
    if (argv.empty())
        argv.push_back("/bin/sh");

    Json::Value createBody;
    createBody["AttachStdout"] = true;
    createBody["AttachStderr"] = true;
    createBody["AttachStdin"] = true;
    createBody["Tty"] = true;
    Json::Value cmd(Json::arrayValue);
    for (const auto& a : argv)
        cmd.append(a);
    createBody["Cmd"] = cmd;

    std::string createBodyText = jsonText(createBody);
    std::string createResp = dockerRequest(
        socketPath_, "/containers/" + containerId + "/exec", &createBodyText);
    std::string execId = parseJson(createResp).get("Id", "").asString();
    if (execId.empty())
        throw std::runtime_error("Docker exec create returned no Id");

    Json::Value startBody;
    startBody["Detach"] = false;
    startBody["Tty"] = true;
    std::string startBodyText = jsonText(startBody);
    std::string output =
        dockerRequest(socketPath_, "/exec/" + execId + "/start", &startBodyText);

    std::string inspectResp = dockerRequest(socketPath_, "/exec/" + execId + "/json");
    Json::Value inspect = parseJson(inspectResp);

    RunResult result;
    result.output = output;
    result.exitCode = inspect.get("ExitCode", 0).asInt();
    return result;
}

} // namespace dockerterminal
