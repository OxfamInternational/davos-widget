# How to integrate into a Wagtail site

This will likely need input from Theo from Torchbox as part of the Oxfam GB integration, but we would hope this wouldn't be overly complicated.

Note that you can use index.html as a working example.

1. Download this repo from GitHub
2. Copy across the below files to your public assets directory (note down locations incase you need to update with future improvements)
    1. `davos-widget-cta.json`
    2. `davos-widget.json`
    3. `davos-widget.css`
    4. `davos-widget.js`
3. Modify the `davos-widget-cta.json` to use your required cta links.
4. Add `<link rel="stylesheet" href="davos-widget.css">` to your site
5. Add the below js so it is loaded in the foot of the body

  ```javascript
    <!-- The js must go at bottom of the page so it can access the DOM -->
    <script src="davos-widget.js"></script>
    <script>
      const davosWidget = new DavosWidget('davos-widget-cta.json', 'davos-widget.json');
      davosWidget.setup();
    </script>
  ```

6. Insert the widget placeholders into your content where you want them to appear: `<span class="davoswidget" data-widget="billionaires"></span>`

## Some considerations

- You may need to update the js/css/json files as improvements are made to the core widget, so note locations and process' appropriately.
- The `davos-widget-cta.json` is open for changes, and whilst `davos-widget.json` can be done in a similar way, this isn't supported by OI.

## Troubleshooting

- First reset any customised json/js/css files to those in this repo.
