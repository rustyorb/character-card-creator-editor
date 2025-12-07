import React from 'react';
import { ActivePage } from '../types';
import MenuItem from './MenuItem';

interface MenuProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

const Menu: React.FC<MenuProps> = ({ activePage, setActivePage }) => (
  <nav className="flex flex-wrap justify-center gap-2 mb-8">
    <MenuItem
      label="AI Card Generator"
      onClick={() => setActivePage('generator')}
      active={activePage === 'generator'}
    />
    <MenuItem
      label="V2 Validator"
      onClick={() => setActivePage('validator')}
      active={activePage === 'validator'}
    />
    <MenuItem
      label="Backfill V1 in V2"
      onClick={() => setActivePage('backfiller')}
      active={activePage === 'backfiller'}
    />
    <MenuItem
      label="Backfill w/ Notice"
      onClick={() => setActivePage('backfillerWithObsolescenceNotice')}
      active={activePage === 'backfillerWithObsolescenceNotice'}
    />
    <MenuItem
      label="Update V1 to V2"
      onClick={() => setActivePage('v1Updater')}
      active={activePage === 'v1Updater'}
    />
    <MenuItem
      label="Example Cards"
      onClick={() => setActivePage('examples')}
      active={activePage === 'examples'}
    />
    <MenuItem
      label="Library (NPM)"
      onClick={() => window.open('https://www.npmjs.com/package/character-card-utils', '_blank')}
      isExternal
    />
    <MenuItem
      label="Library Docs"
      onClick={() =>
        window.open(
          'https://malfoyslastname.github.io/chara-card-utils-docs/modules.html',
          '_blank',
        )
      }
      isExternal
    />
    <MenuItem
      label="Source Code"
      onClick={() =>
        window.open('https://github.com/malfoyslastname/chara-card-utils-web', '_blank')
      }
      isExternal
    />
  </nav>
);

export default Menu;
