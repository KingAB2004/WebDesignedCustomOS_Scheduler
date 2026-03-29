#include "crow_all.h"
#include <sqlite3.h>
#include <iostream>
#include <string>
#include <vector>
#include <chrono>

using namespace std;

string generate_id() {
    auto now = chrono::system_clock::now();
    auto ms = chrono::duration_cast<chrono::milliseconds>(now.time_since_epoch()).count();
    return "JOB-" + to_string(ms);
}

int main() {
    // SQLite Database open
    sqlite3* db;
    if (sqlite3_open("scheduler.db", &db)) {
        cerr << "Can't open database: " << sqlite3_errmsg(db) << "\n";
        return 1;
    }

    // Setting up Crow
    crow::App<crow::CORSHandler> app;  // defineing the core web server class of crow which helps in varoiius request like post get and in the  < >  are the middlewares we need
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global().headers("Content-Type").methods("POST"_method, "GET"_method).origin("http://localhost:8888/"); // configuring the cors     // origin() means accpt content from only my site to prevent hackers to get the data inside and control the os 


    // for getting the jobs from the database

    CROW_ROUTE(app, "/api/jobs").methods("GET"_method)([&db](){    // setting up the router for get request at this site
        vector<crow::json::wvalue> jobs_list;   // where wvalue is a data structure of crow that imitates json 
        string sql = "SELECT id, type, payload, status, priority, delay_seconds FROM jobs ORDER BY created_at DESC;";
        
        sqlite3_stmt* stmt;
        if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                crow::json::wvalue job;
                job["id"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
                job["type"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));    //  when sql gives us the data it is in the form of const unsigned char* which is not the const char form we want and as the sql is written in c so we need to use this function to convert it
                job["payload"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
                job["status"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
                job["priority"] = sqlite3_column_int(stmt, 4);
                job["delaySeconds"] = sqlite3_column_int(stmt, 5); 
                jobs_list.push_back(move(job));
            }
        }
        sqlite3_finalize(stmt);   // to free up the space taken by from the ram otherwise as it is a system daemon it can lead to system crash
        
        return crow::json::wvalue(jobs_list); 
    });

    // using hte post request to insert the data of the job into the sql

    CROW_ROUTE(app, "/api/jobs").methods("POST"_method)([&db](const crow::request& req){
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, "Invalid JSON");

        string id = generate_id();
        string job_type = body["type"].s();
        string payload = body["payload"].s();
        int priority = body["priority"].i();
        int delay_seconds = body.has("delaySeconds") ? body["delaySeconds"].i() : 0;

        string sql = "INSERT INTO jobs (id, type, payload, status, priority, delay_seconds) VALUES ('" + id + "', '" + job_type + "', '" + payload + "', 'PENDING', " + to_string(priority) + ", " + to_string(delay_seconds) + ");";

        char* errMsg = nullptr;
        if (sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg) != SQLITE_OK) {
            cerr << "[DB ERROR] " << errMsg << "\n";
            sqlite3_free(errMsg);
            return crow::response(500, "Database Error");
        }
        return crow::response(201, "Job Scheduled");
    });

    app.port(8080).multithreaded().run();  // multithreaded is use to spwan multiple worker threads that handles the requests simultaneouly  // run is used to keep the server alve
    
    sqlite3_close(db);
    return 0;
}