#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

const dbPath = path.join(process.cwd(), '.devstate.db');

// New Helper: Ensure local .gitignore explicitly blocks the database and node_modules
function ensureLocalGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const rulesToEnsure = ['.devstate.db', 'node_modules/'];
  
  let currentContent = '';
  if (fs.existsSync(gitignorePath)) {
    currentContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  const linesToAdd = [];
  rulesToEnsure.forEach(rule => {
    // If the rule isn't explicitly written in the file yet, prepare to append it
    if (!currentContent.includes(rule)) {
      linesToAdd.push(rule);
    }
  });

  if (linesToAdd.length > 0) {
    // Add a trailing newline if content exists and doesn't end with one
    const padding = currentContent && !currentContent.endsWith('\n') ? '\n' : '';
    fs.appendFileSync(gitignorePath, padding + linesToAdd.join('\n') + '\n');
  }
}

// Automatically enforce local git isolation before initializing anything else
ensureLocalGitignore();

const db = new Database(dbPath);

// Initialize schema matrix
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS context_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    user_note TEXT NOT NULL,
    git_branch TEXT,
    modified_files TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );
`);

function getProjectName() {
  return path.basename(process.cwd());
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return 'main';
  }
}

function getModifiedFiles() {
  try {
    // Standard porcelain status command now that gitignore hides node_modules and db
    const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
    return status || 'No uncommitted functional changes';
  } catch (e) {
    return 'not-a-git-repo';
  }
}

function getLocalDateTimeString() {
  const now = new Date();
  return now.toLocaleString('sv-SE'); // Clean 'YYYY-MM-DD HH:MM:SS' layout
}

function saveContext(message) {
  if (!message) {
    console.error('❌ Error: Please provide a message.');
    process.exit(1);
  }
  
  const projectName = getProjectName();
  const branch = getGitBranch();
  const files = getModifiedFiles();
  const localTime = getLocalDateTimeString();

  const stmt = db.prepare('INSERT OR IGNORE INTO projects (project_name, created_at) VALUES (?, ?)');
  stmt.run(projectName, localTime);
  
  const getStmt = db.prepare('SELECT id FROM projects WHERE project_name = ?');
  const projectId = getStmt.get(projectName).id;

  const insertStmt = db.prepare(`
    INSERT INTO context_logs (project_id, user_note, git_branch, modified_files, created_at) 
    VALUES (?, ?, ?, ?, ?)
  `);
  insertStmt.run(projectId, message, branch, files, localTime);
  
  console.log(`✅ DevState saved for [${projectName}] on branch [${branch}] at local time [${localTime}]`);
}

function resumeContext() {
  const projectName = getProjectName();
  
  const getProjStmt = db.prepare('SELECT id FROM projects WHERE project_name = ?');
  const project = getProjStmt.get(projectName);

  if (!project) {
    console.log(`❌ No DevState found for project: ${projectName}. Run 'save' first.`);
    return;
  }

  const getLogStmt = db.prepare(`
    SELECT * FROM context_logs 
    WHERE project_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `);
  const log = getLogStmt.get(project.id);

  console.log('\n======================================');
  console.log(`🚀 DEVSTATE RESUME: ${projectName}`);
  console.log('======================================');
  console.log(`📅 Local Time: ${log.created_at}`);
  console.log(`🌿 Branch:     ${log.git_branch}`);
  console.log(`📝 Note:       ${log.user_note}`);
  console.log('--------------------------------------');
  console.log(`📂 Uncommitted Files at Save:`);
  console.log(`${log.modified_files}`);
  console.log('======================================\n');
  console.log('📋 Copy this and paste it into your AI!\n');
}

const command = process.argv[2];
const userMessage = process.argv[3];

if (command === 'save') {
  saveContext(userMessage);
} else if (command === 'resume') {
  resumeContext();
} else {
  console.log('\nUsage:');
  console.log('  devstate save "Your note here"');
  console.log('  devstate resume\n');
}