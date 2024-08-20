#!/bin/bash

# 1. Start the Node.js Sequencer App
echo "Starting the Node.js Sequencer..."
npm run dev &
SEQUENCER_PID=$!
echo "Node.js Sequencer started with PID $SEQUENCER_PID"

# 2. Wait for a short time to ensure the sequencer is running
sleep 2

# Function to check if the current timestamp is even
is_even_timestamp() {
    current_time=$(date +%s)
    remainder=$((current_time % 2))
    if [ "$remainder" -eq 0 ]; then
        return 0  # Even
    else
        return 1  # Odd
    fi
}

# Wait until the timestamp is even
while ! is_even_timestamp; do
    sleep 0.5  # Check every half second
done

# 3. Start the Anvil Blockchain
echo "Starting Anvil..."
anvil --block-time 2 --silent & 
ANVIL_PID=$!
echo "Anvil started with PID $ANVIL_PID"

# 4. Deploy the Smart Contract - More security required here
forge script Deploy --fork-url http://127.0.0.1:8545  --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a --broadcast

# 6. Monitor and manage processes
echo "Monitoring the processes. Press [CTRL+C] to stop."
trap "kill $SEQUENCER_PID $ANVIL_PID; exit 0" SIGINT SIGTERM

# 7. Keep the script running to maintain the processes
wait $SEQUENCER_PID
wait $ANVIL_PID