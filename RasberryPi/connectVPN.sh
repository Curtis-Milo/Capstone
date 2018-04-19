#!/bin/bash

TEST="$(ping 4.2.2.1 -c 1 2>&1 | grep -i unreachable)"
TEST_NO_SPACE="$(echo -e "$TEST" | sed -e 's/^[[:space:]]*//')"
echo "TEST is: $TEST"

while ! [ -z "$TEST_NO_SPACE" ]; do
	sleep 1
	TEST="$(ping 4.2.2.1 -c 1 2>&1 | grep -i unreachable)"
	TEST_NO_SPACE="$(echo -e "$TEST" | sed -e 's/^[[:space:]]*//')"
done

sudo openconnect -u guirguk -b 130.113.69.65 --servercert sha256:54e3c659e596c29d301a784978d76e1ad903dd37561b1a62cb7c9fcfc853a75e --passwd-on-stdin < /home/pi/Capstone/RasberryPi/pass > /home/pi/Capstone/RasberryPi/out
