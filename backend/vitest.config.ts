import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DB_PATH: './data/test_securebank.db'
    },
    fileParallelism: false,
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
