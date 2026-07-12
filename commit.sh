#!/bin/bash

# 1. Initialize git and set the remote URL if not already set
if [ ! -d ".git" ]; then
  git init
  git remote add origin https://github.com/Avinash7061/odoohackerz.git
  echo "Initialized git repository."
fi

# 2. Stage and commit files for Muskan-06-git (Assets & Audits)
echo "Staging files for Muskan-06-git..."
git add $(find AssetFlow -type f | grep -iE 'asset|audit')
git commit --author="Muskan-06-git <Muskan-06-git@users.noreply.github.com>" -m "Scaffold Asset Core and Audits modules"

# 3. Stage and commit files for 04nandini0 (Allocations & Bookings)
echo "Staging files for 04nandini0..."
git add $(find AssetFlow -type f | grep -iE 'allocation|booking|transfer')
git commit --author="04nandini0 <04nandini0@users.noreply.github.com>" -m "Scaffold Allocations and Resource Bookings modules"

# 4. Stage and commit files for sujata-dot (Maintenance, Dashboard, Notifications, Reports)
echo "Staging files for sujata-dot..."
git add $(find AssetFlow -type f | grep -iE 'maintenance|dashboard|notification|report|activitylog')
git commit --author="sujata-dot <sujata-dot@users.noreply.github.com>" -m "Scaffold Maintenance, Dashboards, and Notifications modules"

# 5. Stage and commit remaining files for Avinash7061 (Auth, Org, and Base Project Setup)
echo "Staging remaining files for Avinash7061..."
git add AssetFlow/
git commit --author="Avinash7061 <Avinash7061@users.noreply.github.com>" -m "Scaffold Project Base, Auth, and Organization modules"

# 6. Push to main
echo "Setting branch to main and pushing to GitHub..."
git branch -M main
git push -u origin main
