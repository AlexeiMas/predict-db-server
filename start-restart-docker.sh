#!/bin/sh
echo "Restart docker for imagen-therapeutics"

echo "Down containers for imagen-therapeutics"
docker-compose -p imagen-therapeutics -f docker-compose.yml down --remove-orphans
echo "Wait 1 sec"
sleep 1
echo "UP containers for imagen-therapeutics"
docker-compose -p imagen-therapeutics -f docker-compose.yml up  -d --build
exit 0