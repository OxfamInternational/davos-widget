# How to integrate into HTML

Note that you can use index.html as a working example.

1. Download this repo from GitHub
2. Copy across the below files to an `<assets>/davos/` directory (note down the locations incase you need to update with future improvements)
    1. `davos-widget-cta.json`
    2. `davos-widget.json`
    3. `davos-widget.css`
    4. `davos-widget.js`
4. Modify the `davos-widget-cta.json` to use your required cta links.
5. Add `<link rel="stylesheet" href="davos-widget.css">` to your site
6. Add the below js so it is loaded in the foot of the body

  ```javascript
    <!-- The js must go at bottom of the page so it can access the DOM -->
    <script src="davos-widget.js"></script>
    <script>
      const davosWidget = new DavosWidget('davos-widget-cta.json', 'davos-widget.json');
      davosWidget.setup();
    </script>
  ```

6. Insert the widget placeholders into your content where you want them to appear: `<span class="davoswidget" data-widget="billionaires"></span>`
7. If you are going to use the "tweet" cta type, then you will likely also need to add the below js too.

## Some considerations

- You may need to update the js/css/json files as improvements are made to the core widget, so note locations and process' appropriately.
- The `davos-widget-cta.json` is open for changes, and whilst `davos-widget.json` can be done in a similar way, this isn't supported by OI.
- If you use the "tweet" cta type, you may get js conflicts due to this script adding twitters widget.js, this will need to be dealt with on a site by site basis.

## Troubleshooting

- First reset any customised json/js/css files to those in this repo.
