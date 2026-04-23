import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const commitSha = execSync('git rev-parse --short HEAD').toString().trim()

export default defineConfig({
  plugins: [react()],
  base: '/cliff-finder/',
  define: {
    __COMMIT_SHA__: JSON.stringify(commitSha),
  },
})
