# AEM RUM JS - Standalone Configuration using Google Tag Manager
Standalone mode for RUM using Google Tag Manager

## Embed RUM standalone using Google Tag Manager
1. Navigate to [Google Tag Manager console](https://tagmanager.google.com/)

![gtm-console](https://github.com/user-attachments/assets/a74f4678-538d-4f42-81f6-cf16bc399658)

2. Go to Tags
3. Click 'New' to create a new Tag
4. Create a 'New Tag Configuration'

![gtm-new-tag](https://github.com/user-attachments/assets/581e1294-3b61-4255-97c0-f2e672c64e81)

5. Use 'Custom HTML' as the tag type

![gtm-custom-html](https://github.com/user-attachments/assets/75ca518d-3e5c-46c9-9953-d9cc35049eb8)

6. Use the 'RUM Standalone script' and insert below  tag in 'Custom HTML'

```html
<script defer type="text/javascript" src="https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js"/>
```

![gtm-rum-standalone](https://github.com/user-attachments/assets/11979f81-f8ac-47e3-bf73-cead6f5cdf1d)

7. Choose a trigger to fire the tag for 'All Pages'
8. Save and Publish the tag

## Check if RUM was enabled on your site

1. Navigate to your non AEM site
2. Add  query parameter `?rum=on` to your site. Example: https://site.com?rum=on
3. Open browser console and check that `ping` messages are being written

![ping-messages-in-console](https://github.com/adobe/helix-rum-js/assets/43381734/0a2f4b25-0198-41b2-b386-740489b1f7b3)

4. Open the network tab of your browser and validate that ping requests using `POST` method to domain `rum.hlx.page` are being sent and that the response status is `201`

 ![rum-requests-in-network-tab](https://github.com/adobe/helix-rum-js/assets/43381734/766f1c45-223b-40e3-ba57-1237f44c9c15)
