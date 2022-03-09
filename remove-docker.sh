#!/bin/bash

echo "Prune docker imagen-therapeutics"

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker system prune --all -f

echo "Completed"
exit 0;