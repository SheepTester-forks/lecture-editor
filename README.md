# lecture-editor

A UI to allow to faculty to edit their own videos, for my UCSD job.

## Development

```shell
# Start a local development server
$ yarn dev

# Build for production
$ yarn build
```

The script is defined by a list of text and annotations.

- `video-strategy.ts` defines types of annotations and has `exportScript`, which turns the annotations into a script for Arturo's code (unfinished).
- `components/AnnotationContents.tsx` defines the UI for editing annotations.
- `App.tsx` is the top-level component with the editor UI. For example, this can be where the exported script can be sent to the server to generate the video.
- `render/render.ts` renders the video preview.
