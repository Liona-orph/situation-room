# Contributing

Keep the operational model explicit. New statuses or actions need:

- a reviewed transition rule in src/domain.ts;
- a timeline event that explains the change;
- domain and interface tests;
- accessible labels and keyboard behavior.

Before opening a pull request:

    npm run check
