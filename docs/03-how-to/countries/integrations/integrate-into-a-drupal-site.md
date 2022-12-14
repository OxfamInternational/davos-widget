# How to integrate into a Drupal site

As part of the development, we have already integrated this into the OI Drupal site, and as such, will share a module here that could be modified by other Drupal sites.

## Drupal 8/9

- Download the drupal-module.zip file and put into your sites `modules/custom` directory (or wherever appropriate for your setup).
- Alter the `config/install/ox_davos.settings.yml` file to list the pages you wish this to appear on (you can always alter this later in the Ui if you need to).
- You may need to alter the `js/ox_davos.js` file if your site is located somewhere else, just so it can find the widget-code files.
- It is probably worth updating the `widget-code/` files in case this zip is not up to date.
- Enable the module
- Give the `Administer Oxfam Davos widget` permission to the roles that may need it.
- Test it out by adding tokens such as `[ox_davos:food]` to a WYSIWYG editor.

## Troubleshooting

### The token isn't getting replaced

You may need to enable token replacement in your WYSIWYG editor text format.
