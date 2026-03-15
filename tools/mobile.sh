#!/bin/bash
cd /home/ace/Desktop/Swarmtunes-client/
http-server ./site/ -p 8443 --cors --ssl --cert cert.pem --key key.pem
