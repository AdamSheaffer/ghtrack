# GH Tracker

Track students' most recent github activity. To track a cohort, add a .txt file in the `cohorts` directory and name it with the cohort number, i.e. `37.txt`. Then run the script by passing the cohort number as an argument:

```
node tracker.js 37
```

As a shortcut, you can also open the .txt file for a given cohort:

```
node tracker.js 37 open
```

### Example .txt file:

```
https://github.com/walter
https://github.com/donny
https://github.com/bunny
https://github.com/brandt
https://github.com/ulikunkel
https://github.com/maude
https://github.com/elduderino
```
