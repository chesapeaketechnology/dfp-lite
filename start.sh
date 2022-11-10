echo "This might take a while so go get a cup of coffee...";
sleep 2;

# Install the node dependecies for NodeRed
cd node-red/data
npm install

# Install the node dependecies for the web application
cd reveal-lite
npm install

# Run docker-compose to start up the application
cd ../../
docker-compose up
