<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress_dev' );

/** Database username */
define( 'DB_USER', 'wp_user' );

/** Database password */
define( 'DB_PASSWORD', 'wp_password' );

/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'Y2SQ(-*cnX&Ky[U(r<dv}igRirng.vn3 ?i-$I2;P/2mnY?3skN[+$:i9i.:L.YY' );
define( 'SECURE_AUTH_KEY',   'Mdie-*T:5!?C49GmDP8]$;aaJqg^e.+&ej~GE%%IzKX@0*E4J.]7y4CL%9@W0byw' );
define( 'LOGGED_IN_KEY',     '`vUvh_A.7%5Ra+(aNn0tyvZeG]FOr#Dgf#Gx}(.LK%:_g)+Z>(1voe/7Wm6L8z$i' );
define( 'NONCE_KEY',         'A2olfug xhBHCp[W4eSCN0b.Uf]7DEChT5b|n[&2C^LlAYD63o_QgsFaa[u~al-S' );
define( 'AUTH_SALT',         'F?kXiMX Xg7iEI~<_=<X&_RA#JZ5aEw{Y$B3QP/uGy(J:.xPp|BgMfs (<Vg7kF.' );
define( 'SECURE_AUTH_SALT',  '`N^bVaDN_9f(>O^C}s_D@v>ghAQUS(ON?41:xlypc?)QgZ;X=(b^GiZLq1(8Y2&A' );
define( 'LOGGED_IN_SALT',    '|@hwu$b-& $Ul%MxZ_xyY>Xb[ ivx:5/Y}L6w|y2;y8J)CGE]-QpP/Lq<.PpN;+k' );
define( 'NONCE_SALT',        '/Ba6y3Pz9cq99]?y3.}B`i`B:>(yH$a4|NWq`>5z@usO]62FhfmY-Qd9Eq<14yw+' );
define( 'WP_CACHE_KEY_SALT', 'KIBQ`L(M_ym?!<qM {&WpIWc)gJ5^UjJHds!jC( A2O%~`&bg-A?IoRx=T67u>P&' );

putenv('SEO_BACKEND_URL=http://localhost:4000/');

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

