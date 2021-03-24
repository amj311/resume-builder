#/bin/sh

# Set origin
git remote add origin https://github.com/amj311/resume-builder

# Fetch the newest code
git fetch origin master

# Hard reset
git reset --hard origin/master

# Force pull
git pull origin master --force