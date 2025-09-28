# ZeroHost CLI Examples

This document provides practical examples of using the ZeroHost CLI in real-world scenarios.

## Basic Usage Examples

### Simple Text Sharing

```bash
# Share a quick message
zerohost "Hello, world!"

# Share with custom expiry
zerohost "This expires in 1 hour" --expires 1h

# Share with password protection
zerohost "Secret message" --password mysecret
```

### File Sharing

```bash
# Share a configuration file
zerohost --file ~/.bashrc

# Share a script with custom expiry
zerohost --file deploy.sh --expires 2d

# Share with password and burn after reading
zerohost --file secrets.env --password team123 --burn
```

## Development Workflows

### Sharing Code Snippets

```bash
# Share a function you're working on
zerohost --file utils.js --expires 1d --copy

# Share git diff for code review
git diff | zerohost --password review --expires 4h

# Share build output
npm run build 2>&1 | zerohost --expires 1h
```

### Debugging and Logs

```bash
# Share application logs
tail -100 /var/log/myapp.log | zerohost --burn

# Share error traces
python debug_script.py 2>&1 | zerohost --expires 2h

# Share system information
uname -a && lscpu | zerohost --expires 1d
```

### API Integration

```bash
# Share API response for debugging
curl -s "https://api.example.com/data" | zerohost --expires 30m

# Share formatted JSON
curl -s "https://api.github.com/user" | jq '.' | zerohost
```

## System Administration

### Server Configuration

```bash
# Share nginx config (password protected)
zerohost --file /etc/nginx/nginx.conf --password admin --expires 1h

# Share system status
df -h && free -h && uptime | zerohost --expires 4h

# Share network configuration
ifconfig | zerohost --password netadmin --expires 2h
```

### Process Monitoring

```bash
# Share running processes
ps aux | grep nginx | zerohost --expires 1h

# Share resource usage
top -n 1 -b | head -20 | zerohost --burn

# Share disk usage
du -h --max-depth=1 /var/log | zerohost --expires 1d
```

## Database and SQL

### Query Results

```bash
# Share query results (be careful with sensitive data!)
mysql -u user -p database -e "SHOW TABLES;" | zerohost --password db --burn

# Share PostgreSQL schema
pg_dump --schema-only mydb | zerohost --expires 1d --password schema

# Share MongoDB collection stats
mongo --eval "db.stats()" | zerohost --expires 2h
```

## DevOps and CI/CD

### Build and Deploy

```bash
# Share build logs
docker build . 2>&1 | zerohost --expires 1d

# Share deployment status
kubectl get pods --all-namespaces | zerohost --expires 30m

# Share terraform plan
terraform plan | zerohost --password infra --expires 4h
```

### Monitoring and Alerts

```bash
# Share system metrics
iostat -x 1 10 | zerohost --expires 1h

# Share error logs from specific service
journalctl -u myservice --since "1 hour ago" | zerohost --burn

# Share health check results
curl -s http://localhost:8080/health | zerohost --expires 15m
```

## Security and Compliance

### Secure Information Sharing

```bash
# Share credentials securely (use burn after reading!)
echo "username: admin\npassword: $(openssl rand -base64 32)" | \
  zerohost --password team --burn

# Share SSL certificate info
openssl x509 -in cert.pem -text -noout | zerohost --expires 1d

# Share security scan results
nmap -sV target.com | zerohost --password security --expires 2h
```

## Data Processing

### Text Processing

```bash
# Share processed CSV data
cat data.csv | awk -F',' '{print $1","$3}' | zerohost --expires 1d

# Share sorted and filtered logs
grep "ERROR" app.log | sort | uniq -c | zerohost --expires 4h

# Share word count statistics
wc -l *.txt | zerohost --expires 1h
```

### JSON Processing

```bash
# Share filtered JSON
cat large-data.json | jq '.users[] | select(.active == true)' | \
  zerohost --expires 2h

# Share API key counts (remove actual keys!)
grep -r "api_key" . | sed 's/[a-zA-Z0-9]{32,}/[REDACTED]/g' | \
  zerohost --expires 1d
```

## Interactive Mode Examples

### Full Interactive Session

```bash
# Start interactive mode
zerohost --interactive

# This will prompt you for:
# - Content (opens your default editor)
# - Expiry time (menu selection)
# - Password protection (optional)
# - Burn after reading (yes/no)
# - QR code display (yes/no)
# - Copy to clipboard (yes/no)
```

## Team Collaboration

### Code Review

```bash
# Share changes for review
git diff main...feature-branch | \
  zerohost --password review --expires 1d --qr

# Share commit summary
git log --oneline -10 | zerohost --expires 2h --copy
```

### Documentation Sharing

```bash
# Share meeting notes
zerohost --file meeting-notes.md --expires 1w --password team

# Share temporary documentation
cat > temp-doc.md << EOF
# Deployment Steps
1. Run tests
2. Build artifacts
3. Deploy to staging
EOF
zerohost --file temp-doc.md --expires 1d --copy
```

## Automation Scripts

### Scheduled Sharing

```bash
#!/bin/bash
# Daily log sharing script
LOG_FILE="/var/log/myapp.log"
SHARE_URL=$(tail -100 "$LOG_FILE" | zerohost --expires 24h --silent)
echo "Daily logs: $SHARE_URL" | mail -s "Daily Log Report" team@company.com
```

### Error Monitoring

```bash
#!/bin/bash
# Error monitoring script
ERROR_COUNT=$(grep "ERROR" /var/log/app.log | wc -l)
if [ "$ERROR_COUNT" -gt 10 ]; then
    tail -50 /var/log/app.log | zerohost --password alert --burn --silent | \
    xargs -I {} echo "High error count detected: {}" | \
    curl -X POST -H 'Content-Type: application/json' \
         -d '{"text":"High error count: {}"}' \
         https://hooks.slack.com/webhook
fi
```

## Performance Testing

### Benchmark Results

```bash
# Share Apache bench results
ab -n 1000 -c 10 http://example.com/ | zerohost --expires 4h

# Share load testing output
wrk -t12 -c400 -d30s http://example.com | zerohost --expires 1d

# Share database performance
mysqlslap --user=root --password --host=localhost \
  --concurrency=20 --iterations=1000 | zerohost --expires 2h
```

## Best Practices

### Security

1. **Use burn after reading for sensitive data**:
   ```bash
   echo "sensitive_data" | zerohost --burn --password strong_pass
   ```

2. **Set appropriate expiry times**:
   ```bash
   # Short expiry for temporary debugging
   debug_output | zerohost --expires 1h
   
   # Longer expiry for documentation
   zerohost --file README.md --expires 1w
   ```

3. **Use password protection for internal sharing**:
   ```bash
   internal_data | zerohost --password team_password --expires 1d
   ```

### Workflow Integration

1. **Combine with other tools**:
   ```bash
   # Create QR code for mobile access
   zerohost "mobile_data" --qr
   
   # Auto-copy for quick sharing
   zerohost "quick_share" --copy
   ```

2. **Use in shell functions**:
   ```bash
   # Add to ~/.bashrc
   share() {
     if [ -f "$1" ]; then
       zerohost --file "$1" --copy
     else
       zerohost "$1" --copy
     fi
   }
   
   # Usage: share "text" or share file.txt
   ```

## Troubleshooting Examples

### Common Issues

```bash
# Check CLI configuration
zerohost --config

# Test API connectivity
zerohost "test" --silent

# Debug with verbose output
DEBUG=zerohost* zerohost "debug test"

# Check API key validity
zerohost --login
```

### Error Recovery

```bash
# Retry on network error
for i in {1..3}; do
  zerohost "retry attempt $i" && break
  sleep 5
done

# Fallback to file if stdin fails
echo "data" | zerohost || zerohost --file fallback.txt
```