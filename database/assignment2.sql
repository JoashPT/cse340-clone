-- Insert data for `account`
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Update data for `account`
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;
-- Delete data for `account`
DELETE FROM public.account
WHERE account_id = 1;
-- Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors"
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- inventory items that belong to the "Sport" category
SELECT inv_make AS make,
    inv_model AS model,
    classification_name AS classified_as
FROM public.inventory AS inventory
    INNER JOIN public.classification AS classification ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';
-- add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');