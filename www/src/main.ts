import { DocPage } from './_components/doc-page';
import { Header } from './_components/header';
import { InvisibleLink, Link, LinkButton } from './_components/link';
import { Page } from './_components/page';
import { Splash } from './_components/splash';

Page.define('th-page');
DocPage.define('th-doc-page');
Splash.define('th-splash');
Link.define('th-link');
InvisibleLink.define('th-invisible-link');
LinkButton.define('th-link-button');
Header.define('th-header');

// correct the path since static HTML is served from the root of each directory
if (!location.pathname.endsWith('/')) {
	location.pathname = location.pathname + '/';
}
