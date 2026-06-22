# ContriFlow

ContriFlow is a project-centric collaboration platform designed for student clubs, teams, and organizations to manage tasks, track contributions, and maintain a verified record of member involvement.

Unlike traditional task managers, ContriFlow focuses not only on assigning work but also on documenting and recognizing meaningful contributions made by individuals and teams.

## Problem

Student clubs and project teams often struggle with:

* Tracking who contributed to a project
* Managing tasks across multiple members
* Maintaining records of completed work
* Recognizing non-coding contributions such as design, documentation, event management, and outreach
* Preserving contribution history for future leadership transitions

Most teams rely on scattered WhatsApp messages, spreadsheets, and documents, making it difficult to track work accurately.

## Solution

ContriFlow provides a centralized platform where teams can:

* Create and manage projects
* Invite members using project links
* Assign tasks to one or more members
* Submit contributions with supporting evidence
* Approve and verify contributions
* Build a contribution portfolio for every member

## Key Features

### Project Management

* Create and manage projects
* Invite members using unique invite codes
* Role-based access control

### Task Management

* Create and assign tasks
* Support multiple assignees per task
* Track task progress and completion status

### Contribution Tracking

* Submit individual or team contributions
* Attach proof links and supporting evidence
* Approval workflow for contribution verification

### Member Profiles

* View contribution history
* Track completed tasks
* Maintain a verified record of involvement

## Database Design

Core Entities:

* User
* Project
* ProjectMember
* Task
* TaskMember
* Contribution
* ContributionMember

The platform uses a relational database structure to support complex project, task, and contribution relationships.

## Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### ORM

* Prisma

### Authentication

* JWT
* bcrypt

## Current Status

🚧 In Development

Completed:

* PostgreSQL setup
* Prisma integration
* Database schema design
* Migration system setup

Upcoming:

* Authentication system
* Project management APIs
* Task management APIs
* Contribution workflow
* Frontend dashboard

## Future Enhancements

* Project analytics
* Contribution reports
* Team activity timeline
* Portfolio export
* Notifications
* Organization workspaces

## Author

Bhavya Yadav
