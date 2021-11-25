# OSD_SSG

**OSD_SSG** is a static site generator, implemented as part of Seneca College's OSD600 course.

> An _SSG_ is a tool for generating a complete HTML web site from raw data and files, without having to author any HTML by hand. Imagine that you have a folder of text files that you want to turn into a website. An SSG allows you to enter a simple command that creates .html output files from a given set of input files.

## Demo

[Demo](https://dukemanh.github.io/OSD_SSG/demo/)

## Options

```
Options:
Options:
  -c, --config      Path to JSON config file                            [string]
  -i, --input       File or folder to be parsed              [string] [required]
  -o, --output      Output folder                    [string] [default: "build"]
  -r, --recursive   Recursively parsed files          [boolean] [default: false]
  -e, --relative    Maintain relative folder of files [boolean] [default: false]
  -s, --stylesheet  Custom stylesheet   [string] [default: "markdowncss/modest"]
  -l, --lang        HTML language code               [string] [default: "en-CA"]
  -h, --help        Show help                                          [boolean]
  -v, --version     Show version number                                [boolean]
```

## Features

- Accept .txt and .md files

## Authors

- [@Dukemanh](https://www.github.com/dukemanh)

## License

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
