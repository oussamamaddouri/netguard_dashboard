# Load necessary scripts
@load policy/tuning/json-logs.zeek

@load policy/frameworks/notice
@load policy/protocols/http/detect-sql-injection
@load policy/protocols/ssh/detect-bruteforcing
@load policy/protocols/ssl/expiring-certs

# Configure logging
redef LogAscii::json_timestamps = JSON::TS_ISO8601;
redef Log::default_scope_sep = "_";
redef Log::default_field_name_map = {
    ["."] = "_",
    ["-"] = "_",
};

# Set the log directory
redef Log::default_logdir = "/opt/zeek/logs";
redef Log::default_rotation_interval = 24 hrs;

# Enable all logs
redef HTTP::default_capture_password = T;
redef FTP::default_capture_password = T;
redef SOCKS::default_capture_password = T;
