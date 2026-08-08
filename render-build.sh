#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install
