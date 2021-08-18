# pocket-gen

## Install pre-reqs

`curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh && sudo bash nodesource_setup.sh && sudo apt install -y nodejs && sudo npm install -g yarn`

## One liner with chowns

`sudo chown -R alex:alex /home/alex/nodes/pokt && npx ts-node src/index.ts && sudo chown -R 1005:1001 /home/alex/nodes/pokt`