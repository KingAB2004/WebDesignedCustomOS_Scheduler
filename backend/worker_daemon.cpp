#include "crow_all.h"
#include <sqlite3.h>
#include <iostream>
#include <string>
#include <thread> // using MultiThreading
#include <chrono>
#include <cstdlib>

using namespace std;

void execute_os_command(const string& cmd) {
    system(cmd.c_str());
}

void update_job_status(const string& id, const string& status) {
    sqlite3* db;
    if (sqlite3_open("scheduler.db", &db) == SQLITE_OK) {
        sqlite3_busy_timeout(db, 5000); 
        string sql = "UPDATE jobs SET status = '" + status + "' WHERE id = '" + id + "';";
        sqlite3_exec(db, sql.c_str(), nullptr, nullptr, nullptr);
        sqlite3_close(db);
    }
}

void process_job_in_background(string id, string type, string payload_str) {
    
    auto payload = crow::json::load(payload_str);
    
    if (type == "OPEN_URL") {
        execute_os_command("xdg-open " + string(payload["url"].s()));  // xdg stands for Cross-Desktop Group 
    } 
    else if (type == "START_TIMER") {
        int duration = payload["duration_seconds"].i();
        execute_os_command("sleep " + to_string(duration) + " && notify-send 'Hello Guys' ' Your Timer Finished!'"); 
    }
    else if (type == "PLAY_AUDIO") {
        execute_os_command("paplay " + string(payload["file_path"].s())); 
    }
    else if (type == "OS_SHUTDOWN") {
        execute_os_command("shutdown now");
    }
    else if (type == "TAKE_SCREENSHOT") {
        string path = payload["save_path"].s();
        if (path.empty()) path = "/home/" + id + ".png"; 
        
        string cmd = "env -i PATH=/usr/bin:/bin DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus XDG_RUNTIME_DIR=/run/user/$(id -u) gnome-screenshot -f " + path;
        execute_os_command(cmd);
    }
    update_job_status(id, "COMPLETED");
}

int main() {
    sqlite3* db;
    if (sqlite3_open("scheduler.db", &db)) {
        cerr << "Can't open database\n";
        return 1;
    }
    sqlite3_busy_timeout(db, 5000); // tells the sql that if any thread is making changes in the sql then wait for 5 secs and then continue without throwing an error


    while (true) {
        string sql = "SELECT id, type, payload FROM jobs WHERE status = 'PENDING' AND datetime(created_at, '+' || delay_seconds || ' seconds') <= datetime('now') ORDER BY priority ASC, created_at ASC LIMIT 1;";
        
        sqlite3_stmt* stmt;
        
        string id, type, payload_str;
        bool job_found = false;

        if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
            if (sqlite3_step(stmt) == SQLITE_ROW) {
                id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
                type = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
                payload_str = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
                job_found = true;
            }
        }
        sqlite3_finalize(stmt); // destroy the statement to prevent memory leaks

        if (job_found) {
            string update_sql = "UPDATE jobs SET status = 'RUNNING' WHERE id = '" + id + "';";
            sqlite3_exec(db, update_sql.c_str(), nullptr, nullptr, nullptr);

            thread worker(process_job_in_background, id, type, payload_str);
            worker.detach(); // tells the program to continue and not care about the thread
        }

        this_thread::sleep_for(chrono::seconds(2));
    }

    sqlite3_close(db);
    return 0;
}