Output demo.gif

Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Dracula"
Set Padding 20
Set TypingSpeed 50ms

# Stage files
Type "git add src/auth.ts src/middleware/jwt.ts"
Enter
Sleep 500ms

# Run aic (uses mock script behind the scenes for demo)
Type "aic"
Enter
Sleep 500ms

Hide
Type "bash scripts/demo-mock.sh"
Enter
Show
Sleep 8s
