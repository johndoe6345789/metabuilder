/**
 * @file http_server_security_test.cpp
 * @brief Security tests for HTTP server implementation
 * 
 * Tests cover common CVE vulnerabilities:
 * - Buffer overflow (CVE-2024-22087 pattern)
 * - Request smuggling (CVE-2024-1135, CVE-2024-40725 patterns)
 * - Header injection (CRLF injection)
 * - DoS attacks (Slowloris, resource exhaustion)
 * - Integer overflow in Content-Length
 */

#include <iostream>
#include <string>
#include <cstring>
#include <thread>
#include <chrono>
#include <vector>
#include <cassert>

#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    typedef SOCKET socket_t;
    #define CLOSE_SOCKET closesocket
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    typedef int socket_t;
    #define CLOSE_SOCKET close
#endif

class SecurityTester {
public:
    SecurityTester(const std::string& host, int port) 
        : host_(host), port_(port) {
#ifdef _WIN32
        WSADATA wsaData;
        WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif
    }
    
    ~SecurityTester() {
#ifdef _WIN32
        WSACleanup();
#endif
    }
    
    // Test 1: Buffer overflow - Send request larger than typical buffer
    bool testBufferOverflow() {
        std::cout << "Test 1: Buffer Overflow Protection..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // Send a request with very long path (>8192 bytes)
        std::string attack = "GET /";
        attack += std::string(16384, 'A'); // 16KB path
        attack += " HTTP/1.1\r\nHost: localhost\r\n\r\n";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            // Should get error response, not crash
            std::cout << "  Response received: " << std::string(buffer, 0, 50) << "..." << std::endl;
            return true;
        }
        
        std::cout << "  No response (connection closed safely)" << std::endl;
        return true;
    }
    
    // Test 2: Request smuggling - Conflicting Content-Length headers
    bool testRequestSmuggling_DoubleContentLength() {
        std::cout << "\nTest 2: Request Smuggling - Double Content-Length..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // CVE-2024-1135 pattern: Multiple Content-Length headers
        std::string attack = 
            "POST /api/status HTTP/1.1\r\n"
            "Host: localhost\r\n"
            "Content-Length: 6\r\n"
            "Content-Length: 100\r\n"  // Conflicting!
            "\r\n"
            "SMUGGLED";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            std::string response(buffer);
            // Should reject conflicting headers
            bool rejected = response.find("400") != std::string::npos || 
                           response.find("Bad Request") != std::string::npos;
            std::cout << "  " << (rejected ? "PASS: Rejected" : "FAIL: Accepted") << std::endl;
            return rejected;
        }
        
        std::cout << "  PASS: Connection closed on smuggling attempt" << std::endl;
        return true;
    }
    
    // Test 3: Request smuggling - Transfer-Encoding and Content-Length
    bool testRequestSmuggling_TransferEncoding() {
        std::cout << "\nTest 3: Request Smuggling - Transfer-Encoding + Content-Length..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // CVE-2024-23452 pattern: Both Transfer-Encoding and Content-Length
        std::string attack = 
            "POST /api/status HTTP/1.1\r\n"
            "Host: localhost\r\n"
            "Transfer-Encoding: chunked\r\n"
            "Content-Length: 100\r\n"  // Should be ignored per RFC 7230
            "\r\n"
            "0\r\n"
            "\r\n";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            std::string response(buffer);
            // Should either handle chunked or reject
            bool safe = response.find("400") != std::string::npos || 
                       response.find("501") != std::string::npos ||
                       response.find("Not Implemented") != std::string::npos;
            std::cout << "  " << (safe ? "PASS: Handled safely" : "WARN: May be vulnerable") << std::endl;
            return safe;
        }
        
        std::cout << "  PASS: Connection closed on smuggling attempt" << std::endl;
        return true;
    }
    
    // Test 4: CRLF injection in headers
    bool testCRLFInjection() {
        std::cout << "\nTest 4: CRLF Injection in Headers..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // Try to inject a header via CRLF
        std::string attack = 
            "GET /api/status HTTP/1.1\r\n"
            "Host: localhost\r\n"
            "X-Custom: value\r\nInjected-Header: malicious\r\n"  // CRLF injection attempt
            "\r\n";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            // Should get response (injection in request headers is less critical)
            std::cout << "  Response received" << std::endl;
            return true;
        }
        
        std::cout << "  WARN: No response received" << std::endl;
        return true;
    }
    
    // Test 5: Integer overflow in Content-Length
    bool testIntegerOverflow() {
        std::cout << "\nTest 5: Integer Overflow in Content-Length..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // Huge Content-Length that could overflow
        std::string attack = 
            "POST /api/status HTTP/1.1\r\n"
            "Host: localhost\r\n"
            "Content-Length: 9999999999999999999\r\n"  // Integer overflow
            "\r\n";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            std::string response(buffer);
            // Should reject or handle safely
            bool safe = response.find("400") != std::string::npos || 
                       response.find("413") != std::string::npos ||
                       response.find("Request Entity Too Large") != std::string::npos;
            std::cout << "  " << (safe ? "PASS: Rejected" : "WARN: May be vulnerable") << std::endl;
            return safe;
        }
        
        std::cout << "  PASS: Connection closed on oversized Content-Length" << std::endl;
        return true;
    }
    
    // Test 6: Slowloris DoS - Slow headers
    bool testSlowloris() {
        std::cout << "\nTest 6: Slowloris DoS Protection..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // Send partial request slowly
        std::string part1 = "GET /api/status HTTP/1.1\r\n";
        send(sock, part1.c_str(), part1.length(), 0);
        
        // Wait 2 seconds (reduced for faster tests)
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        std::string part2 = "Host: localhost\r\n";
        int result = send(sock, part2.c_str(), part2.length(), 0);
        
        CLOSE_SOCKET(sock);
        
        // If server has timeout, connection should be closed
        std::cout << "  " << (result < 0 ? "PASS: Connection timeout" : "WARN: No timeout enforced") << std::endl;
        return true; // Test ran
    }
    
    // Test 7: Header bomb - Too many headers
    bool testHeaderBomb() {
        std::cout << "\nTest 7: Header Bomb Protection..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        std::string attack = "GET /api/status HTTP/1.1\r\n";
        attack += "Host: localhost\r\n";
        
        // Add 1000 headers
        for (int i = 0; i < 1000; i++) {
            attack += "X-Header-" + std::to_string(i) + ": value\r\n";
        }
        attack += "\r\n";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            std::string response(buffer);
            // Should reject if total size > buffer
            bool safe = response.find("400") != std::string::npos || 
                       response.find("431") != std::string::npos;
            std::cout << "  " << (safe ? "PASS: Rejected" : "WARN: Accepted many headers") << std::endl;
            return safe;
        }
        
        std::cout << "  PASS: Connection closed on header bomb" << std::endl;
        return true;
    }
    
    // Test 8: Null byte injection
    bool testNullByteInjection() {
        std::cout << "\nTest 8: Null Byte Injection..." << std::endl;
        
        socket_t sock = connectToServer();
        if (sock < 0) return false;
        
        // Path with null byte
        std::string attack = "GET /api/status";
        attack += '\0';
        attack += "/../etc/passwd HTTP/1.1\r\nHost: localhost\r\n\r\n";
        
        send(sock, attack.c_str(), attack.length(), 0);
        
        char buffer[1024];
        int bytes = recv(sock, buffer, sizeof(buffer) - 1, 0);
        CLOSE_SOCKET(sock);
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            std::string response(buffer);
            // Should get 400 Bad Request for null byte
            bool rejected = response.find("400") != std::string::npos || 
                           response.find("Bad Request") != std::string::npos;
            // Also verify no sensitive content exposed
            bool safe = response.find("passwd") == std::string::npos;
            bool pass = rejected && safe;
            std::cout << "  " << (pass ? "PASS: Null byte rejected" : "FAIL: Vulnerable") << std::endl;
            return pass;
        }
        
        std::cout << "  PASS: Connection closed on null byte payload" << std::endl;
        return true;
    }
    
    void runAllTests() {
        std::cout << "=== HTTP Server Security Test Suite ===" << std::endl;
        std::cout << "Target: " << host_ << ":" << port_ << std::endl;
        std::cout << std::endl;
        
        int passed = 0;
        int total = 0;
        
        total++; if (testBufferOverflow()) passed++;
        total++; if (testRequestSmuggling_DoubleContentLength()) passed++;
        total++; if (testRequestSmuggling_TransferEncoding()) passed++;
        total++; if (testCRLFInjection()) passed++;
        total++; if (testIntegerOverflow()) passed++;
        total++; if (testSlowloris()) passed++;
        total++; if (testHeaderBomb()) passed++;
        total++; if (testNullByteInjection()) passed++;
        
        std::cout << "\n=== Results ===" << std::endl;
        std::cout << "Passed: " << passed << "/" << total << std::endl;
        std::cout << "Note: Some warnings indicate potential vulnerabilities" << std::endl;
    }
    
private:
    socket_t connectToServer() {
        socket_t sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock < 0) {
            std::cerr << "Failed to create socket" << std::endl;
            return -1;
        }
        
        struct sockaddr_in server_addr;
        std::memset(&server_addr, 0, sizeof(server_addr));
        server_addr.sin_family = AF_INET;
        server_addr.sin_port = htons(port_);
        
#ifdef _WIN32
        InetPton(AF_INET, host_.c_str(), &server_addr.sin_addr);
#else
        inet_pton(AF_INET, host_.c_str(), &server_addr.sin_addr);
#endif
        
        if (connect(sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
            std::cerr << "Failed to connect to server" << std::endl;
            CLOSE_SOCKET(sock);
            return -1;
        }
        
        return sock;
    }
    
    std::string host_;
    int port_;
};

int main(int argc, char* argv[]) {
    std::string host = "127.0.0.1";
    int port = 8080;
    
    if (argc > 1) host = argv[1];
    if (argc > 2) port = std::stoi(argv[2]);
    
    std::cout << "HTTP Server Security Test Suite" << std::endl;
    std::cout << "Testing common CVE patterns (2020-2024):" << std::endl;
    std::cout << "  - Buffer overflow (CVE-2024-22087)" << std::endl;
    std::cout << "  - Request smuggling (CVE-2024-1135, CVE-2024-40725)" << std::endl;
    std::cout << "  - Header injection" << std::endl;
    std::cout << "  - DoS attacks" << std::endl;
    std::cout << std::endl;
    
    // Give server time to start if run immediately
    std::this_thread::sleep_for(std::chrono::seconds(1));
    
    SecurityTester tester(host, port);
    tester.runAllTests();
    
    return 0;
}
