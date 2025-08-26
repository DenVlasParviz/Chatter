import React from 'react'

import {useState} from 'react'
import {useChannelStateContext} from "stream-chat-react";
import {useUser} from "@clerk/clerk-react"
import {HashIcon, LockIcon, PinIcon, UserIcon, VideoIcon} from "lucide-react";
import MembersModal from "./MembersModal.jsx";
import PinnedMessagesModal from "./PinnedMessagesModal.jsx";
import InviteModal from "./InviteModal.jsx";

const CustomChannelHeader = () => {
    const {channel} = useChannelStateContext()
    const {user} = useUser()
    const memberCount = Object.keys(channel.state.members).length

    const [showInvite, setShowInvite] = useState(false)
    const [showMember, setShowMember] = useState(false)
    const [showPinnedMessages, setShowPinnedMessages] = useState(false)
    const [pinnedMessages, setPinnedMessages] = useState([])

    const otherUser = Object.values(channel.state.members).find(
        (member) => member.user.id !== user.id
    )
    const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");
    const handleShowPinned = async () => {
        const channelState = await channel.query()
        setPinnedMessages(channelState.pinned_messages);
        setShowPinnedMessages(true)
    }
    const handleVideoCall = async () => {
        if (channel) {
            const callUrl = `${window.location.origin}/call/${channel.id}`
            await channel.sendMessage({
                text: `Я почав відеозв'язок. Приєднуйся! ${callUrl}`
            })
        }

    }


    return (
        <div className='h-14 border-b border-gray-200 flex items-center px-4 justify-between bg-white'>
            <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                    {channel.data?.private ? (
                        <LockIcon className='size-4 text-[#616061]'/>
                    ) : (
                        <HashIcon className='size-4 text-[#616061]'/>
                    )}

                    {isDM && otherUser?.user?.image && (
                        <img src={otherUser.user.image} alt={otherUser.user.name}
                             className='size-7 rounded-full object-cover' style={{marginRight: 4}}/>
                    )}

                    <span
                        className='font-medium text-[#1d1c1d]'> {isDM ? otherUser?.user?.name || otherUser?.user?.id : channel.data?.id}</span>
                </div>


            </div>
            <div className='flex items-center gap-3'>
                <button className='flex items-center gap-2 hover:bg-white py-1 px-2 rounded'
                        onClick={() => setShowMember(true)}>
                    <UserIcon className='size-5 text-gray-500'/>
                    <span className='text-sm text-gray-500'>{memberCount}</span>
                </button>

                <button className='hover:bg-white p-1 rounded' onClick={() => handleVideoCall()}
                        title="Почати відеозустріч">
                    <VideoIcon className='size-5 text-gray-500'/>

                </button>
                {channel.data?.private && (
                    <button className='btn btn-primary' onClick={()=>setShowInvite(true)}>Invite</button>
                )}
                <button className='hover:bg-white p-1 rounded' onClick={handleShowPinned}>
                    <PinIcon className='size-5 text-gray-500'/>
                </button>
            </div>
            {showMember && (
                <MembersModal members={Object.values(channel.state.members)} onClose={()=>setShowMember(false)}/>
            )}
            {showPinnedMessages && (
                <PinnedMessagesModal
                    pinnedMessages={pinnedMessages}
                    onClose={() => setShowPinnedMessages(false)}
                />
            )}

            {showInvite &&(
                <InviteModal channel ={channel} onClose={()=>setShowInvite(false)}/>
            )}

        </div>
    )
}
export default CustomChannelHeader
