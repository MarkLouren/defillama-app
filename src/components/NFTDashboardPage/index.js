import React, { useEffect } from 'react'
import { useMedia } from 'react-use'
import dynamic from 'next/dynamic'
import { transparentize } from 'polished'
import styled from 'styled-components'

import { useDisplayUsdManager, useHideLastDayManager } from '../../contexts/LocalStorage'
import { AutoRow, RowBetween, RowFlat } from '../Row'
import { AutoColumn } from '../Column'
import Filters from '../Filters'
import { CheckMarks } from '../SettingsModal'
import { PageWrapper, ContentWrapper } from '..'
import Panel from '../Panel'
import Search from '../Search'
import NFTCollectionList from '../NFTCollectionList'
import { TYPE, ThemedBackground } from '../../Theme'
import { formattedNum } from '../../utils'
import { chainCoingeckoIds } from '../../constants/chainTokens'
import SEO from 'components/SEO'

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const BreakpointPanels = styled.div`
  @media screen and (min-width: 800px) {
    width: 100%;
    display: flex;
    padding: 0;
    align-items: center;
  }
`

const BreakpointPanelsColumn = styled(AutoColumn)`
  height: 100%;
  width: 100%;
  margin-right: 10px;
  max-width: 350px;
  @media (max-width: 800px) {
    max-width: initial;
    margin-bottom: 10px;
  }
`

const FiltersRow = styled(RowFlat)`
  @media screen and (min-width: 800px) {
    width: calc(100% - 90px);
  }
`
const defaultChainOption = {
  label: 'All',
  to: '/nfts'
}

const GlobalNFTChart = dynamic(() => import('../GlobalNFTChart'), {
  ssr: false
})

const NFTDashboard = ({
  totalVolumeUSD,
  dailyVolumeUSD,
  dailyChange,
  collections,
  chart,
  chainData,
  displayName = 'All'
}) => {
  useEffect(() => window.scrollTo(0, 0))

  const [hideLastDay] = useHideLastDayManager()
  const below800 = useMedia('(max-width: 800px)')
  const selectedChain = displayName
  const setSelectedChain = newSelectedChain => `/nfts/chain/${newSelectedChain}`

  let chainOptions = [
    defaultChainOption,
    ...chainData
      ?.sort((a, b) => parseInt(b.totalVolumeUSD) - parseInt(a.totalVolumeUSD))
      ?.map(chain => ({
        label: chain.displayName,
        to: setSelectedChain(chain.chain)
      }))
  ]

  const isHomePage = selectedChain === 'All'
  let dailyVolume = chart.length ? chart[chart.length - 1].dailyVolume : 0 //TODO Return from backend
  let [displayUsd] = useDisplayUsdManager()
  let symbol = chainCoingeckoIds[selectedChain]?.symbol
  let unit = ''

  if (isHomePage) {
    displayUsd = true
    symbol = 'USD'
    unit = '$'
  }

  if (hideLastDay) {
    chart = chart.slice(0, -1)
    if (chart.length > 1) {
      dailyVolume = chart[chart.length - 1].dailyVolume
      dailyChange = ((dailyVolume - chart[chart.length - 2].dailyVolume) / chart[chart.length - 2].dailyVolume) * 100
    }
  }

  const panels = (
    <>
      <Panel style={{ padding: '18px 25px' }}>
        <AutoColumn gap="4px">
          <RowBetween>
            <TYPE.heading>Total Volume</TYPE.heading>
          </RowBetween>
          <RowBetween style={{ marginTop: '4px', marginBottom: '4px' }} align="flex-end">
            <TYPE.main fontSize={'33px'} lineHeight={'39px'} fontWeight={600} color={'#4f8fea'}>
              {formattedNum(totalVolumeUSD, true)}
            </TYPE.main>
          </RowBetween>
        </AutoColumn>
      </Panel>
      <Panel style={{ padding: '18px 25px' }}>
        <AutoColumn gap="4px">
          <RowBetween>
            <TYPE.heading>Daily Volume</TYPE.heading>
          </RowBetween>
          <RowBetween style={{ marginTop: '4px', marginBottom: '4px' }} align="flex-end">
            <TYPE.main fontSize={'33px'} lineHeight={'39px'} fontWeight={600} color={'#fd3c99'}>
              {formattedNum(dailyVolumeUSD, true)}
            </TYPE.main>
          </RowBetween>
        </AutoColumn>
      </Panel>
      <Panel style={{ padding: '18px 25px' }}>
        <AutoColumn gap="4px">
          <RowBetween>
            <TYPE.heading>Change (24h)</TYPE.heading>
          </RowBetween>
          <RowBetween style={{ marginTop: '4px', marginBottom: '4px' }} align="flex-end">
            <TYPE.main fontSize={'33px'} lineHeight={'39px'} fontWeight={600} color={'#46acb7'}>
              {dailyChange?.toFixed(2)}%
            </TYPE.main>
          </RowBetween>
        </AutoColumn>
      </Panel>
    </>
  )

  const tvl = formattedNum(totalVolumeUSD, true)

  return (
    <PageWrapper>
      <SEO cardName={displayName} chain={displayName} tvl={tvl} nftPage />
      <ThemedBackground backgroundColor={transparentize(0.8, '#445ed0')} />
      <ContentWrapper>
        <AutoColumn gap="24px" style={{ paddingBottom: '24px' }}>
          <Search />
          <CheckMarks type="nfts" />
        </AutoColumn>
        <BreakpointPanels>
          <BreakpointPanelsColumn gap="10px">{panels}</BreakpointPanelsColumn>
          <Panel style={{ height: '100%', minHeight: '347px' }}>
            <GlobalNFTChart
              chartData={chart}
              dailyVolume={dailyVolume}
              dailyVolumeChange={dailyChange}
              symbol={symbol}
              unit={unit}
            />
          </Panel>
        </BreakpointPanels>
        <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
          <RowBetween>
            <TYPE.main fontSize={'1.125rem'}>NFT Rankings</TYPE.main>
            <FiltersRow>
              <Filters
                filterOptions={chainOptions}
                setActive={setSelectedChain}
                activeLabel={selectedChain}
                justify="end"
              />
            </FiltersRow>
          </RowBetween>
        </ListOptions>
        <Panel style={{ marginTop: '6px', padding: below800 && '1rem 0 0 0 ' }}>
          <NFTCollectionList collections={collections} displayUsd={displayUsd} />
        </Panel>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default NFTDashboard
