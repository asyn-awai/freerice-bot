# **Freerice Bot (Dead)**

## **This bot isn't effective anymore (see notes section).**

A bot that automates the collection of rice on [freerice.com](http://freerice.com). Built with [Typescript](https://www.typescriptlang.org/).

## Features

-   `Multithreading` - Run multiple bots at once to farm rice faster.
-   `Auto Answer` - Automatically answer questions.
-   `No Delay` - No delay between questions (other than fetch time, of course).
-   `Random User Agents` - Random user agents for each bot, refreshes often and when needed to prevent blocks/rate limits.

## How to use

1. Enter your username and password into `config.ts`
2. Toggle any other options you may need to in `config.ts`
    - `numProcesses` - The number of processes to run. Each process will run a separate instance of the bot. More processes typically means more rice, however, it's recommended to stay close to the number of cores your CPU has.
    - `logErrors` - Whether or not to log errors to the console.
    - `showInstance` - Whether or not to show the instance number in the console.
    - `showQuestions` - Whether or not to show the questions and answers in the console.
    - `showNumSolved` - Whether or not to show the number of questions solved by the instance in the console.
    - `showRiceCount` - Whether or not to show the user's rice count in the console (not accurate).
3. Run `npm install`
4. Run `ts-node main.ts`

## Notes

-   `Creation` - I created this bot as just a fun project to introduce myself to web automation. I also saw it as a challenge, as I couldn't find any other bots that used Typescript/Node.js and didn't use the DevTools console.

-   `Death of Freerice Bot` - The bot was able to net around **10 million grains of rice per day** when it was first created. Over time the bot harvested less rice (going as low as 1 - 3 million) for whatever reason, causing the bot to become less effective. As of publishing this, the site had implemented a system to block mass requests from the same IP address. The bot still works, but only to a very small fraction of its original effectiveness, as it'll be blocked after a while.
