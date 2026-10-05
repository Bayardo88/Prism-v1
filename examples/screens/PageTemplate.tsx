/**
 * Page template — the base of every screen.
 *
 * Shows the template with its BODY-SLOT placeholder (default) and with real
 * content dropped into the slot (`#content`). Built entirely from
 * @scalar/design-system; this file contains no colour, spacing or type value of
 * its own.
 *
 * Copy this file, keep the five slots, and replace the children.
 */
import {
  Avatar, Badge, Button, CompanyInfo, CurrencySelector, InformationLabel, MainMenuItem, Notification,
  PageTemplate, PrimaryMenu, ScalarProvider, SearchBar, SecondaryMenu, SecondaryMenuItem, Selector,
  TertiaryMenu, TertiaryMenuItem, WorkspaceDrawer, WorkspaceDrawerTab,
  Cell, ColumnHeader, DataGrid, Row, ToolSwitch,
} from '@scalar/design-system';
import { useState } from 'react';

export function PageTemplateExample({ withContent = false }: { withContent?: boolean }) {
  const [tool, setTool] = useState<'valuations' | 'workboard'>('valuations');
  return (
    <ScalarProvider mode="system" viewport="auto">
      <PageTemplate
        /* 1 · navigation */
        navigation={
          <PrimaryMenu
            end={
              <>
                <SearchBar readOnly />
                <Notification unread />
                <ToolSwitch value={tool} onChange={setTool} />
                <Avatar size="s" initials="BV" alt="Bayardo V." />
              </>
            }
          >
            <MainMenuItem current>Intelligence</MainMenuItem>
            <MainMenuItem>Valuations</MainMenuItem>
            <MainMenuItem>Waterfalls</MainMenuItem>
            <MainMenuItem>Documents</MainMenuItem>
            <MainMenuItem>Reports</MainMenuItem>
            <Selector label="Measurement Date" value="01/17/2024" />
          </PrimaryMenu>
        }
        /* 2 · companyInfo */
        companyInfo={
          <CompanyInfo
            name="Apple Inc."
            status={<Badge>Draft</Badge>}
            end={
              <>
                <InformationLabel label="Equity Value" value="$34,560,000" />
                <InformationLabel label="Unrealized Firm Total" value="$48,871,695" />
              </>
            }
          >
            <SecondaryMenu>
              <SecondaryMenuItem>Summary</SecondaryMenuItem>
              <SecondaryMenuItem>Financials</SecondaryMenuItem>
              <SecondaryMenuItem>Cap Table</SecondaryMenuItem>
              <SecondaryMenuItem current>Valuations</SecondaryMenuItem>
              <SecondaryMenuItem>Waterfall</SecondaryMenuItem>
            </SecondaryMenu>
          </CompanyInfo>
        }
        /* 3 · subNavigation */
        subNavigation={
          <TertiaryMenu
            onAdd={() => {}}
            end={
              <>
                <CurrencySelector currency="USD">($) Thousands</CurrencySelector>
                <Button size="s" tone="positive">Save</Button>
              </>
            }
          >
            <TertiaryMenuItem current>Summary</TertiaryMenuItem>
            <TertiaryMenuItem>GPC</TertiaryMenuItem>
            <TertiaryMenuItem>Backsolve</TertiaryMenuItem>
          </TertiaryMenu>
        }
        /* 5 · drawer */
        drawer={
          <WorkspaceDrawer
            docked
            tabs={
              <>
                <WorkspaceDrawerTab label="Data Review" count={6} ai />
                <WorkspaceDrawerTab label="Notes" />
                <WorkspaceDrawerTab label="Sheets" />
                <WorkspaceDrawerTab label="Documents" />
              </>
            }
          />
        }
      >
        {/* 4 · BODY-SLOT — children replace the placeholder. Omit them to see it. */}
        {withContent ? (
          <DataGrid
            label="Example"
            head={
              <>
                <ColumnHeader>Security</ColumnHeader>
                <ColumnHeader numeric>Shares</ColumnHeader>
              </>
            }
          >
            <Row>
              <Cell>Series A Preferred</Cell>
              <Cell numeric>1,250,000</Cell>
            </Row>
            <Row>
              <Cell>Common</Cell>
              <Cell numeric>8,000,000</Cell>
            </Row>
          </DataGrid>
        ) : undefined}
      </PageTemplate>
    </ScalarProvider>
  );
}
