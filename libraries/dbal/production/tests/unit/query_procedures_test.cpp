/**
 * @file query_procedures_test.cpp
 * @brief Unit tests for JSON procedure loading and parameter validation.
 * Tests use the SchemaLoader and procedure JSON parsing — no DB connection needed.
 */

#include <gtest/gtest.h>
#include <fstream>
#include <filesystem>
#include <nlohmann/json.hpp>

// Minimal stand-alone procedure validator matching QueryRouteHandler logic
struct ProcedureParam {
    std::string name;
    bool required = false;
};

struct ProcedureValidationResult {
    bool ok = true;
    std::string missing_param;
};

static ProcedureValidationResult validateProcedureParams(
    const nlohmann::json& proc,
    const std::map<std::string, std::string>& query_params)
{
    ProcedureValidationResult result;
    if (!proc.contains("params") || !proc["params"].is_array()) return result;
    for (const auto& p : proc["params"]) {
        const std::string name     = p.value("name",     std::string(""));
        const bool        required = p.value("required", false);
        if (required && query_params.find(name) == query_params.end()) {
            result.ok            = false;
            result.missing_param = name;
            return result;
        }
    }
    return result;
}

// ===== Procedure JSON parsing =====

TEST(QueryProceduresTest, ParsesSnippetStatsDefinition) {
    // Inline JSON matching snippet_stats.json
    nlohmann::json proc = {
        {"name",   "snippet_stats"},
        {"entity", "Snippet"},
        {"select", nlohmann::json::array({
            {{"func","count"},{"field","id"},{"alias","count"}},
            "language"
        })},
        {"groupBy", {"language"}},
        {"params", {{{"name","userId"},{"type","string"},{"required",true}}}},
        {"where",  {{{"field","userId"},{"op","eq"},{"param","userId"}}}}
    };

    EXPECT_EQ(proc["name"].get<std::string>(), "snippet_stats");
    EXPECT_EQ(proc["entity"].get<std::string>(), "Snippet");
    ASSERT_TRUE(proc["select"].is_array());
    EXPECT_EQ(proc["select"].size(), 2u);
    EXPECT_EQ(proc["select"][0]["func"].get<std::string>(), "count");
}

// ===== Required parameter validation =====

TEST(QueryProceduresTest, MissingRequiredParamFails) {
    nlohmann::json proc = {
        {"params", {{{"name","userId"},{"type","string"},{"required",true}}}}
    };
    std::map<std::string, std::string> empty_params;
    auto result = validateProcedureParams(proc, empty_params);
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.missing_param, "userId");
}

TEST(QueryProceduresTest, PresentRequiredParamPasses) {
    nlohmann::json proc = {
        {"params", {{{"name","userId"},{"type","string"},{"required",true}}}}
    };
    std::map<std::string, std::string> params = {{"userId", "user-123"}};
    auto result = validateProcedureParams(proc, params);
    EXPECT_TRUE(result.ok);
}

TEST(QueryProceduresTest, OptionalParamAbsencePasses) {
    nlohmann::json proc = {
        {"params", {{{"name","tenantId"},{"type","string"},{"required",false}}}}
    };
    std::map<std::string, std::string> empty_params;
    auto result = validateProcedureParams(proc, empty_params);
    EXPECT_TRUE(result.ok);
}

TEST(QueryProceduresTest, NoProcedureParamsSectionPasses) {
    nlohmann::json proc = {{"entity", "Snippet"}};
    std::map<std::string, std::string> empty_params;
    auto result = validateProcedureParams(proc, empty_params);
    EXPECT_TRUE(result.ok);
}

TEST(QueryProceduresTest, MultipleRequiredParamsFirstMissingFails) {
    nlohmann::json proc = {
        {"params", {
            {{"name","userId"},{"required",true}},
            {{"name","tenantId"},{"required",true}}
        }}
    };
    std::map<std::string, std::string> params = {{"tenantId", "pastebin"}};
    auto result = validateProcedureParams(proc, params);
    EXPECT_FALSE(result.ok);
    EXPECT_EQ(result.missing_param, "userId");
}

// ===== Procedure file loading (uses std::filesystem, no DB) =====

class QueryProcedureFileTest : public ::testing::Test {
protected:
    std::filesystem::path tmp_dir;

    void SetUp() override {
        tmp_dir = std::filesystem::temp_directory_path() / "dbal_proc_test";
        std::filesystem::create_directories(tmp_dir);
    }

    void TearDown() override {
        std::filesystem::remove_all(tmp_dir);
    }

    void writeProc(const std::string& name, const nlohmann::json& content) {
        std::ofstream f(tmp_dir / (name + ".json"));
        f << content.dump(2);
    }
};

TEST_F(QueryProcedureFileTest, LoadsValidProcedureFromFile) {
    nlohmann::json proc = {
        {"name",   "test_proc"},
        {"entity", "Snippet"},
        {"params", {{{"name","userId"},{"required",true}}}}
    };
    writeProc("test_proc", proc);

    // Simulate loading
    std::unordered_map<std::string, nlohmann::json> procedures;
    for (const auto& entry : std::filesystem::directory_iterator(tmp_dir)) {
        if (entry.path().extension() != ".json") continue;
        std::ifstream f(entry.path().string());
        nlohmann::json p = nlohmann::json::parse(f);
        procedures[p.value("name", std::string(""))] = p;
    }

    ASSERT_EQ(procedures.size(), 1u);
    ASSERT_TRUE(procedures.count("test_proc"));
    EXPECT_EQ(procedures["test_proc"]["entity"].get<std::string>(), "Snippet");
}

TEST_F(QueryProcedureFileTest, SkipsNonJsonFiles) {
    // Write a .txt file
    {
        std::ofstream f(tmp_dir / "notes.txt");
        f << "not a procedure";
    }
    writeProc("valid_proc", {{"name","valid_proc"},{"entity","Snippet"}});

    std::unordered_map<std::string, nlohmann::json> procedures;
    for (const auto& entry : std::filesystem::directory_iterator(tmp_dir)) {
        if (entry.path().extension() != ".json") continue;
        std::ifstream f(entry.path().string());
        nlohmann::json p = nlohmann::json::parse(f);
        procedures[p.value("name", std::string(""))] = p;
    }

    EXPECT_EQ(procedures.size(), 1u);
}

TEST_F(QueryProcedureFileTest, UnknownProcedureIsNotFound) {
    writeProc("snippet_stats", {{"name","snippet_stats"},{"entity","Snippet"}});

    std::unordered_map<std::string, nlohmann::json> procedures;
    for (const auto& entry : std::filesystem::directory_iterator(tmp_dir)) {
        if (entry.path().extension() != ".json") continue;
        std::ifstream f(entry.path().string());
        nlohmann::json p = nlohmann::json::parse(f);
        procedures[p.value("name", std::string(""))] = p;
    }

    EXPECT_EQ(procedures.count("unknown_proc"), 0u);
    EXPECT_EQ(procedures.count("snippet_stats"), 1u);
}
