#!/bin/bash
# Using grep output instead to check for address keywords in the js file
curl -s https://firsttimehomebuyer.manus.space/assets/index-COATrsYk.js | grep -ioE '.{0,40}suite.{0,40}|.{0,40}blvd.{0,40}|.{0,40}street.{0,40}|.{0,40}road.{0,40}' | head -n 10
