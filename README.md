# Domus Userscripts

This repository houses a collection of userscripts for personal use.

## Supported Sites

- [AnimeWorld](https://www.animeworld.ac/) — Download MP4 videos from play pages

## Installation

To get started, follow these simple steps:

- **Install the Script Manager**: Begin by installing the [Violent Monkey](https://violentmonkey.github.io/) script manager extension. You can download it [here](https://violentmonkey.github.io/get-it/).
- **Clone the Repository**: Clone this repository to your local machine using Git:

```bash
git clone git@github.com:Giglium/domus-userscripts.git
cd domus-userscripts
```

- **Install Dependencies**: Navigate to the cloned repository directory and install the necessary dependencies:

```bash
make init
```

- **Build the Scripts**: Once the dependencies are installed, build the scripts using npm:

```bash
make build
```

- **Install Scripts on Violent Monkey**: With the scripts built, locate the `dist` folder within the repository directory. You'll find the compiled scripts here. Follow the instructions provided by [Violent Monkey](https://violentmonkey.github.io/) on [how to install userscripts](https://violentmonkey.github.io/guide/creating-a-userscript/).
