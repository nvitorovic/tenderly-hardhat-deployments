## md -> gitbooks

## md > docx
Problem:

- content crew likes using Google Docs to edit and collaborate on the content.
- Gitbook requires MD
- Google docs don't persist some MD markup (the language for code blocks, backticks for variables etc)

Solution:

- Text shown in google docs must retain backticks and other meta information
- To convert `pandoc -s my.md -o my.docx`
- Before converting MD to docx, double your MD:

### add escaped backticks so 

```
    `let x = 2`
```
becomes

    `\`let x = 2\``

### escape codeblocks: 

    ```
        ```tsx
        let x = 2
        ```
    ```

becomes

```
    ```
    \`\`\`tsx
    let x = 2
    \`\`\`\`
    ```
```

- Result: meta is preserved after conversion too google docx
- When importing back from google docs: have content exported as docx
- TODO: instead of escaping MD extend markup with `{#code lang=tsx}...{/code}`

## docx > md
- Input: docx with all code blocks and inline code escaped
- H1 in docx marks a start of a new page in MD
- To convert: `pandoc --extract-media . -s edited.docx -o edited.md`
- Run a script to convert `edited.md`

TODO:
- support page splitting based on H1
- Optionally bump up remaining headers (h2->h1)