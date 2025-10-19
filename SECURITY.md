# Security Policy

## Supported Versions

This project is in early development. Security updates will be applied to the latest version only.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **DO NOT** open a public issue
2. Email the maintainers privately or use GitHub's private vulnerability reporting
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work on a fix as soon as possible.

## Security Considerations

This client connects to Jellyfin servers and handles authentication tokens. Key security practices:

- HTTPS enforced for production (localhost HTTP allowed in dev)
- Tokens stored in sessionStorage (cleared on tab close)
- No credentials stored in localStorage
- Secret scanning enabled in repository
- Dependabot security updates enabled

## Dependencies

We use Dependabot to automatically monitor and update dependencies with known vulnerabilities. Security updates are prioritized and merged quickly.
