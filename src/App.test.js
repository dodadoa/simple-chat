import React from 'react';
import App from './App';
import {
  render,
  waitForElement,
  fireEvent,
  wait,
  cleanup,
} from '@testing-library/react'
import {
  toHaveValue,
  toBeVisible,
  toContainElement
} from 'jest-dom'

import chatWithJaneHistoryData from './chatData/Jane.json'
import chatWithAustinHistoryData from './chatData/Austin.json'

const chatData = {
  Jane: chatWithJaneHistoryData,
  Austin: chatWithAustinHistoryData
}
const thisUserName = 'Bob'

expect.extend({ toHaveValue, toBeVisible, toContainElement })


describe('<App/>', () => {

  describe('Given that the chat data is not load to App', () => {
    afterEach(cleanup);

    test('when user click the channel select, then see only one option (= no data)', async () => {
      const { getByTestId } = render(<App thisUserName={thisUserName} />);
      const select = await waitForElement(() => getByTestId('channelSelection'));
      const noDataOption = await waitForElement(() => getByTestId('noDataOption'))
      expect(select).toContainElement(noDataOption)
    })
  })

  describe('Given that you are on the chat with Jane', () => {
    afterEach(cleanup);

    test('when the data is loaded, then you see the chat from Jane (= What would you like to buy today?)', async () => {
      const { getByText } = render(<App chatData={chatData} thisUserName={thisUserName}/>);
      const loadedText = await waitForElement(() => getByText('What would you like to buy today?'))
      expect(loadedText).toBeVisible();
    })

    test('when you fill the input box with word and click send, then the text is appear on the chat above', async () => {
      const { getByTestId, getByText } = render(<App chatData={chatData} thisUserName={thisUserName}/>)
      fireEvent.change(
        getByTestId('chatText'),
        { target: {  value: 'some chat text from Bob' } }
      );
      fireEvent.click(getByTestId('submitChat'));
      await wait(expect(getByText('some chat text from Bob')).toBeVisible());
    })

    test('when you fill the input box with word and click send, then the input box is reset', async () => {
      const { getByTestId } = render(<App chatData={chatData} thisUserName={thisUserName}/>)
      fireEvent.change(
        getByTestId('chatText'),
        { target: { value: 'some chat text from Bob' } }
      );
      await wait(expect(getByTestId('chatText')).toHaveValue('some chat text from Bob'))
      fireEvent.click(getByTestId('submitChat'));
      await wait(expect(getByTestId('chatText')).toHaveValue(''));
    })

    test('when change the channel to Austin, the chat text is changed to conversation with Austin (= Hello)', async () => {
      const { getByTestId, getByText } = render(<App chatData={chatData} thisUserName={thisUserName}/>);
      const select = await waitForElement(() => getByTestId('channelSelection'));
      fireEvent.change(select, { target: { value: 'Austin' } });
      const loadedText = await waitForElement(() => getByText('Hello'));
      expect(loadedText).toBeVisible();
    })
  })

  describe('Given that you are on the chat with Jane and already send message to jane', () => {

    let wrapper

    beforeEach(() => {
      const container = render(<App chatData={chatData} thisUserName={thisUserName}/>)
      const { getByTestId } = container
      fireEvent.change(
        getByTestId('chatText'),
        { target: { value: 'some chat text from Bob' } }
      );
      fireEvent.click(getByTestId('submitChat'));
      wrapper = container;
    })

    afterEach(cleanup)

    test('when change the channel to Austin and back to Jane, then should see the message that already send to Jane', async () => {
      const { getByText, getByTestId } = wrapper;

      const selectForAustin = await waitForElement(() => getByTestId('channelSelection'));
      fireEvent.change(selectForAustin, { target: { value: 'Austin' } });

      const selectForJane = await waitForElement(() => getByTestId('channelSelection'));
      fireEvent.change(selectForJane, { target: { value: 'Jane' }});

      const sendMessage = await waitForElement(() => getByText('some chat text from Bob'));
      expect(sendMessage).toBeVisible();

    })
  })

})


