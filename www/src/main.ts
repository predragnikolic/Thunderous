import { DocPage } from './_components/doc-page';
import { InvisibleLink, Link } from './_components/link';
import { Page } from './_components/page';
import { Splash } from './_components/splash';

Page.define('th-page');
DocPage.define('th-doc-page');
Splash.define('th-splash');
Link.define('th-link');
InvisibleLink.define('th-invisible-link');

// correct the path since static HTML is served from the root of each directory
if (!location.pathname.endsWith('/')) {
	location.pathname = location.pathname + '/';
}
