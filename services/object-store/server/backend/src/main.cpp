/**
 * @file main.cpp
 * @brief S3-compatible server entry point.
 */

#include "services/Globals.h"
#include <drogon/drogon.h>
#include <iostream>

int main(int argc, char* argv[])
{
    std::string dataDir = "/data/s3";
    std::string dbConn = "host=localhost port=5432 "
                         "dbname=s3server "
                         "user=s3user password=s3pass";
    std::string region = "us-east-1";
    int port = 9000;

    // Override from environment
    if (auto e = std::getenv("S3_DATA_DIR"))
        dataDir = e;
    if (auto e = std::getenv("S3_DB_CONN"))
        dbConn = e;
    if (auto e = std::getenv("S3_REGION"))
        region = e;
    if (auto e = std::getenv("S3_PORT"))
        port = std::stoi(e);

    s3::Globals::init(dataDir, dbConn, region);

    drogon::app()
        .setLogPath("./")
        .setLogLevel(trantor::Logger::kInfo)
        .addListener("0.0.0.0", port)
        .setThreadNum(4)
        // Accept blob uploads up to 2 GB. Default is 1 MB
        // which rejects Docker layer pushes with HTTP 413.
        .setClientMaxBodySize(2ULL * 1024 * 1024 * 1024)
        .run();

    return 0;
}
