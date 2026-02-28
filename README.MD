React PHP Timetable Management System
📌 Description

Web application for managing academic timetables.
Allows assigning modules to formateurs and handling planning data.

🛠 Technologies Used

React (Frontend)

PHP (Backend API)

MySQL


HTML / CSS
✅ Implemented Features

Insert planning entries

Fetch planning data

Basic login system

Display timetable

Conflict validation logic

convert from fill excel or word to json

I improved performance by filtering the selected data from the DB, restricting the module list to the selected group, and the teacher list to the selected module

Performance Issue Identified 90%(not complete i need just to modify samethinge in react)


🚧 In Progress

fix time table of stagiare 

validate max hours

UI improvements

#####
⚡ Performance Issue Identified

After importing Excel files (converted to JSON), a large amount of data is stored in the database.

The dashboard currently retrieves all records using unfiltered queries, which causes:

Slow API response time

Large JSON payload

Slow rendering in React

🛠 Planned Optimization

Replace SELECT * with selective column queries

Add filtering using WHERE conditions

Implement pagination (LIMIT / OFFSET)

Add database indexing on frequently filtered fields

Reduce frontend rendering load

Status: Scheduled for next iteration.
#####