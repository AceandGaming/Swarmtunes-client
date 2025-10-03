#!/bin/bash
cd /home/ace/Desktop/swarmtunes/
http-server . -p 8443 --cors --ssl --cert cert.pem --key key.pem
