import { Component, Element, Listen, Prop } from '@stencil/core';
import { Config, Nav, NavContainer } from '../../index';
import { isReady } from '../../utils/helpers';

const rootNavs = new Map<number, Nav>();

@Component({
  tag: 'ion-app',
  styleUrls: {
    ios: 'app.ios.scss',
    md: 'app.md.scss'
  },
  host: {
    theme: 'app'
  }
})
export class App {

  @Element() element: HTMLElement;
  @Prop({ context: 'config' }) config: Config;

  @Listen('body:navInit')
  registerRootNav(event: CustomEvent) {
    rootNavs.set((event.detail as Nav).navId, (event.detail as Nav));
  }



  componentWillLoad() {
    componentDidLoadImpl(this);
  }

  getActiveNavs(rootNavId?: number): NavContainer[] {
    /*const portal = portals.get(PORTAL_MODAL);
    if (portal && portal.views && portal.views.length) {
      return findTopNavs(portal);
    }
    */
    // TODO - figure out if a modal is open, don't use portal
    if (!rootNavs.size) {
      return [];
    }
    if (rootNavId) {
      return findTopNavs(rootNavs.get(rootNavId));
    }
    if (rootNavs.size === 1) {
      return findTopNavs(rootNavs.values().next().value);
    }
    // fallback to just using all root navs
    let activeNavs: NavContainer[] = [];
    rootNavs.forEach(nav => {
      activeNavs = activeNavs.concat(findTopNavs(nav));
    });
    return activeNavs;
  }

  getNavByIdOrName(nameOrId: number | string) {
    const navs = Array.from(rootNavs.values());
    for (const navContainer of navs) {
      const match = getNavByIdOrNameImpl(navContainer, nameOrId);
      if (match) {
        return match;
      }
    }
    return null;
  }

  protected render() {
    return (
      <slot></slot>
    );
  }
}


export function findTopNavs(nav: NavContainer): NavContainer[] {
  let containers: NavContainer[] = [];
  const childNavs = nav.getActiveChildNavs();
  if (!childNavs || !childNavs.length) {
    containers.push(nav);
  } else {
    childNavs.forEach(childNav => {
      const topNavs = findTopNavs(childNav);
      containers = containers.concat(topNavs);
    });
  }
  return containers;
}

export function getNavByIdOrNameImpl(nav: NavContainer, id: number | string): NavContainer {
  if (nav.id === id || nav.name === id) {
    return nav;
  }
  for (const child of nav.getAllChildNavs()) {
    const tmp = getNavByIdOrNameImpl(child, id);
    if (tmp) {
      return tmp;
    }
  }
  return null;
}

export function componentDidLoadImpl(app: App) {
  app.element.classList.add(app.config.get('mode'));
  // TODO add platform classes
  if (app.config.getBoolean('hoverCSS', true)) {
    app.element.classList.add('enable-hover');
  }
  // TODO fire platform ready
}

export function handleBackButtonClick(): Promise<any> {
  // if there is a menu controller dom element, hydrate it, otherwise move on
  // TODO ensure ion-menu-controller is the name
  const menuControllerElement = document.querySelector('ion-menu-controller'); // TODO - use menu controller types
  const promise = menuControllerElement ?  isReady(menuControllerElement) : Promise.resolve();
  return promise.then(() => {
    // TODO check if the menu is open, close it if so
    console.log('todo');
  });
}