import config from "@christopherjbaker/eslint-config/react-strict"

export default [
  ...config,
  {
    ignores: ["dist/**", "server/**", "api/**", "scripts/**", "EXTRA/**"],
  },
]
