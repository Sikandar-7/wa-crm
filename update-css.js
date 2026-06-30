import fs from 'fs';

const cssPath = 'src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

// The file has blocks like:
// html[data-theme="emerald"] {
//   --background: oklch(0.135 0.01 200);
//   ...
// }

// We want to change the existing blocks to `html.dark[data-theme="..."]`
// And add new blocks for `html[data-theme="..."]` (light mode).

const themes = ["violet", "emerald", "cobalt", "amber", "rose"];

for (const theme of themes) {
  // Find the block
  const regex = new RegExp(`html\\[data-theme="${theme}"\\]\\s*{([^}]*)}`, 'g');
  
  css = css.replace(regex, (match, content) => {
    // Generate light mode version
    // We keep primary the same (or slightly darker, but let's keep it same for now)
    // We change background, foreground, etc.
    let lightContent = content;
    lightContent = lightContent.replace(/--background:\s*[^;]+;/, '--background: oklch(1 0 0);');
    lightContent = lightContent.replace(/--foreground:\s*[^;]+;/, '--foreground: oklch(0.14 0.01 260);');
    lightContent = lightContent.replace(/--card:\s*[^;]+;/, '--card: oklch(1 0 0);');
    lightContent = lightContent.replace(/--card-foreground:\s*[^;]+;/, '--card-foreground: oklch(0.14 0.01 260);');
    lightContent = lightContent.replace(/--popover:\s*[^;]+;/, '--popover: oklch(1 0 0);');
    lightContent = lightContent.replace(/--popover-foreground:\s*[^;]+;/, '--popover-foreground: oklch(0.14 0.01 260);');
    
    lightContent = lightContent.replace(/--secondary:\s*[^;]+;/, '--secondary: oklch(0.96 0.01 260);');
    lightContent = lightContent.replace(/--secondary-foreground:\s*[^;]+;/, '--secondary-foreground: oklch(0.14 0.01 260);');
    lightContent = lightContent.replace(/--muted:\s*[^;]+;/, '--muted: oklch(0.96 0.01 260);');
    lightContent = lightContent.replace(/--muted-foreground:\s*[^;]+;/, '--muted-foreground: oklch(0.45 0.01 260);');
    lightContent = lightContent.replace(/--accent:\s*[^;]+;/, '--accent: oklch(0.96 0.01 260);');
    lightContent = lightContent.replace(/--accent-foreground:\s*[^;]+;/, '--accent-foreground: oklch(0.14 0.01 260);');
    
    lightContent = lightContent.replace(/--border:\s*[^;]+;/, '--border: oklch(0.92 0.01 260);');
    lightContent = lightContent.replace(/--input:\s*[^;]+;/, '--input: oklch(0.92 0.01 260);');
    
    lightContent = lightContent.replace(/--sidebar:\s*[^;]+;/, '--sidebar: oklch(0.98 0.01 260);');
    lightContent = lightContent.replace(/--sidebar-foreground:\s*[^;]+;/, '--sidebar-foreground: oklch(0.14 0.01 260);');
    lightContent = lightContent.replace(/--sidebar-accent:\s*[^;]+;/, '--sidebar-accent: oklch(0.94 0.01 260);');
    lightContent = lightContent.replace(/--sidebar-accent-foreground:\s*[^;]+;/, '--sidebar-accent-foreground: oklch(0.14 0.01 260);');
    lightContent = lightContent.replace(/--sidebar-border:\s*[^;]+;/, '--sidebar-border: oklch(0.92 0.01 260);');

    // Return both light and dark blocks
    return `html[data-theme="${theme}"] {${lightContent}}\n\nhtml.dark[data-theme="${theme}"] {${content}}`;
  });
}

// Also fix the `:root` rule that was combined with violet
css = css.replace(/:root,\nhtml\[data-theme="violet"\]/g, 'html[data-theme="violet"]');
// Add a clean :root for light mode fallback (just a copy of light violet)
css += `\n\n:root {\n  --background: oklch(1 0 0);\n  --foreground: oklch(0.14 0.01 260);\n  --card: oklch(1 0 0);\n  --card-foreground: oklch(0.14 0.01 260);\n  --popover: oklch(1 0 0);\n  --popover-foreground: oklch(0.14 0.01 260);\n  --primary: oklch(0.526 0.247 293);\n  --primary-foreground: oklch(0.985 0 0);\n  --primary-hover: oklch(0.6 0.22 293);\n  --primary-soft: oklch(0.526 0.247 293 / 0.12);\n  --primary-soft-2: oklch(0.526 0.247 293 / 0.2);\n  --secondary: oklch(0.96 0.01 260);\n  --secondary-foreground: oklch(0.14 0.01 260);\n  --muted: oklch(0.96 0.01 260);\n  --muted-foreground: oklch(0.45 0.01 260);\n  --accent: oklch(0.96 0.01 260);\n  --accent-foreground: oklch(0.14 0.01 260);\n  --destructive: oklch(0.577 0.245 27.325);\n  --border: oklch(0.92 0.01 260);\n  --input: oklch(0.92 0.01 260);\n  --ring: oklch(0.526 0.247 293);\n  --chart-1: oklch(0.526 0.247 293);\n  --chart-2: oklch(0.556 0 0);\n  --chart-3: oklch(0.439 0 0);\n  --chart-4: oklch(0.371 0 0);\n  --chart-5: oklch(0.269 0 0);\n  --radius: 0.625rem;\n  --sidebar: oklch(0.98 0.01 260);\n  --sidebar-foreground: oklch(0.14 0.01 260);\n  --sidebar-primary: oklch(0.526 0.247 293);\n  --sidebar-primary-foreground: oklch(0.985 0 0);\n  --sidebar-accent: oklch(0.94 0.01 260);\n  --sidebar-accent-foreground: oklch(0.14 0.01 260);\n  --sidebar-border: oklch(0.92 0.01 260);\n  --sidebar-ring: oklch(0.526 0.247 293);\n}\n\n.dark {\n  --background: oklch(0.13 0.01 260);\n  --foreground: oklch(0.985 0 0);\n  --card: oklch(0.18 0.01 260);\n  --card-foreground: oklch(0.985 0 0);\n  --popover: oklch(0.18 0.01 260);\n  --popover-foreground: oklch(0.985 0 0);\n  --primary: oklch(0.526 0.247 293);\n  --primary-foreground: oklch(0.985 0 0);\n  --primary-hover: oklch(0.6 0.22 293);\n  --primary-soft: oklch(0.526 0.247 293 / 0.12);\n  --primary-soft-2: oklch(0.526 0.247 293 / 0.2);\n  --secondary: oklch(0.22 0.01 260);\n  --secondary-foreground: oklch(0.985 0 0);\n  --muted: oklch(0.22 0.01 260);\n  --muted-foreground: oklch(0.65 0.01 260);\n  --accent: oklch(0.22 0.01 260);\n  --accent-foreground: oklch(0.985 0 0);\n  --destructive: oklch(0.577 0.245 27.325);\n  --border: oklch(0.28 0.01 260);\n  --input: oklch(0.28 0.01 260);\n  --ring: oklch(0.526 0.247 293);\n  --chart-1: oklch(0.526 0.247 293);\n  --chart-2: oklch(0.556 0 0);\n  --chart-3: oklch(0.439 0 0);\n  --chart-4: oklch(0.371 0 0);\n  --chart-5: oklch(0.269 0 0);\n  --radius: 0.625rem;\n  --sidebar: oklch(0.16 0.01 260);\n  --sidebar-foreground: oklch(0.985 0 0);\n  --sidebar-primary: oklch(0.526 0.247 293);\n  --sidebar-primary-foreground: oklch(0.985 0 0);\n  --sidebar-accent: oklch(0.22 0.01 260);\n  --sidebar-accent-foreground: oklch(0.985 0 0);\n  --sidebar-border: oklch(0.28 0.01 260);\n  --sidebar-ring: oklch(0.526 0.247 293);\n}\n`;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated globals.css');
