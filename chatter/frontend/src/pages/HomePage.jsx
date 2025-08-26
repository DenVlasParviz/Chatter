import React, {useEffect, useState} from 'react'
import {UserButton} from "@clerk/clerk-react";
import {useSearchParams} from "react-router";
import {useStreamChat} from "../hooks/useStreamChat.js";
import PageLoader from "../components/PageLoader.jsx";
import "../styles/stream-chat-theme.css"
import {Chat, Channel, ChannelList, MessageList, MessageInput, Thread, Window} from "stream-chat-react";
import {HashIcon, PlusIcon, UserIcon} from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal.jsx";
import CustomChannelPreview from "../components/CustomChannelPreview.jsx";
import UsersList from "../components/UsersList.jsx";
import CustomChannelHeader from "../components/CustomChannelHeader.jsx";

const HomePage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const {chatClient, error, isLoading} = useStreamChat();

    useEffect(() => {
        //set active channel from URL
        if (chatClient) {
            const channelId = searchParams.get("channel");
            if (channelId) {
                const channel = chatClient.channel("messaging", channelId);
                setActiveChannel(channel)
            }
        }
    }, [chatClient, searchParams])
    if (error) return <p>Something went wrong: {error.message}</p>
    if (isLoading || !chatClient) {
        return <PageLoader/>
    }
    return (
        <div className='chat-wrapper'>
            <Chat client={chatClient}>
                <div className='chat-container'>
                    {/*   Left sidebar*/}
                    <div className='str-chat__channel-list'>
                        <div className="team_channel-list">
                            {/*    Header */}
                            <div className='team-channel-list__header gap-4'>
                                <div className='brand-container'>
                                    <img src="/Logo.png" alt="Logo" className='brand-logo'/>
                                    <span className='brand-name'>Chatter</span>
                                </div>
                                <div className='user-button-wrapper'>
                                    <UserButton/>
                                </div>
                            </div>
                            {/*    Channels list */}
                            <div className="team-channel-list__content">
                                <div className="create-channel-section">
                                    <button onClick={() => setIsCreateModalOpen(true)} className="create-channel-btn">
                                        <PlusIcon className='size-4'/>
                                        <span>Створити канал</span>
                                    </button>
                                </div>
                                {/*    Channel list*/}
                                <ChannelList
                                    filters={{members: {$in: [chatClient?.user.id]}}}
                                    options={{state: true, watch: true}}
                                    Preview={({channel}) => (
                                        <CustomChannelPreview

                                            channel={channel}
                                            activeChannel={activeChannel}
                                            setActiveChannel={(channel) => setSearchParams({channel: channel.id})}
                                        />

                                    )}
                                    List={({children, loading, error}) => (
                                        <div className='channel-sections'>
                                            <div className='section-header'>
                                                <div className='section-title'>
                                                    <HashIcon className='size-4'/>
                                                    <span>Канали</span>
                                                </div>
                                            </div>
                                            {loading && <div className='loading-message'>Loading channels </div>}
                                            {error && <div className='error-message'>Error loading channels</div>}
                                            <div className='channels-list'>
                                                {children}
                                            </div>
                                            <div className='section-header direct-messages'>
                                                <div className='section-title'>
                                                    <UserIcon className='size-4'/>
                                                    <span>Приватні повідомлення</span>
                                                </div>
                                            </div>
                                            <UsersList activeChannel={activeChannel}/>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    {/*    Right container*/}
                    <div className='chat-main'>
                        <Channel channel={activeChannel}>
                            <Window>
                                <CustomChannelHeader/>
                                <MessageList/>
                                <MessageInput/>
                            </Window>
                            <Thread/>
                        </Channel>

                    </div>
                </div>
                {isCreateModalOpen && (

                    <CreateChannelModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                )}
            </Chat>

            <p>Home page</p>
        </div>

    )
}
export default HomePage
