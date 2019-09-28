const rollup = require("rollup")
const copy = require("rollup-plugin-copy-glob")
const chalk = require("chalk")

const backgroundWatcher = rollup.watch({
  input: "src/background/main.js",
  output: {
    file: "build/background.js",
    format: "cjs"
  },
  plugins: [
    copy(
      [
        {
          files: "public/**/*.*",
          dest: "build"
        },
        {
          files: "public/assets",
          dest: "build"
        }
      ],
      { watch: true, verbose: true }
    )
  ]
})

const contentWatcher = rollup.watch({
  input: "src/content_script/main.js",
  output: {
    file: "build/content_script.js",
    format: "cjs"
  }
})

const buildLogger = event => {
  switch (event.code) {
    case "START":
      break
    case "BUNDLE_START":
      console.log(
        chalk.blue(`[${event.code}]`),
        event.input,
        chalk.blue("to"),
        event.output.join()
      )
      break
    case "BUNDLE_END":
      console.log(
        chalk.blue(`[${event.code}]`),
        event.input,
        chalk.blue("to"),
        event.output.join(),
        chalk.blue("in"),
        event.duration,
        "ms"
      )
      break
    case "END":
      break
    case "ERROR":
    case "FATAL":
      console.error(chalk.red(`[${event.code}]`))
      console.error(chalk.red(event.error))
      break
  }
}

backgroundWatcher.on("event", buildLogger)
contentWatcher.on("event", buildLogger)
