'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Quote, Undo, Redo, Code } from 'lucide-react'
import { useCallback } from 'react'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL:', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const addImage = useCallback(() => {
        const url = window.prompt('URL hình ảnh:')

        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    const Button = ({ onClick, isActive = false, disabled = false, title, children }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            type="button"
            className={`p-2 rounded-lg transition-all ${isActive
                ? 'bg-apple-blue text-white shadow-sm'
                : 'text-apple-text-secondary hover:bg-apple-bg hover:text-apple-text'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    )

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-apple-bg/50 border-b border-apple-border sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-0.5 border-r border-apple-border pr-2 mr-1">
                <Button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="In đậm (Ctrl+B)"
                >
                    <Bold size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="In nghiêng (Ctrl+I)"
                >
                    <Italic size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Gạch chân (Ctrl+U)"
                >
                    <UnderlineIcon size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Gạch ngang"
                >
                    <Strikethrough size={16} />
                </Button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-apple-border pr-2 mr-1">
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Tiêu đề lớn"
                >
                    <Heading1 size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Tiêu đề nhỏ"
                >
                    <Heading2 size={16} />
                </Button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-apple-border pr-2 mr-1">
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Căn trái"
                >
                    <AlignLeft size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Căn giữa"
                >
                    <AlignCenter size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Căn phải"
                >
                    <AlignRight size={16} />
                </Button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-apple-border pr-2 mr-1">
                <Button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Danh sách"
                >
                    <List size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Danh sách số"
                >
                    <ListOrdered size={16} />
                </Button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-apple-border pr-2 mr-1">
                <Button
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    title="Thêm Link"
                >
                    <LinkIcon size={16} />
                </Button>
                <Button
                    onClick={addImage}
                    title="Thêm ảnh từ URL"
                >
                    <ImageIcon size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Trích dẫn"
                >
                    <Quote size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code size={16} />
                </Button>
            </div>

            <div className="flex items-center gap-0.5 ml-auto">
                <Button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <Undo size={16} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Làm lại (Ctrl+Y)"
                >
                    <Redo size={16} />
                </Button>
            </div>
        </div>
    )
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-apple-blue hover:underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Nhập nội dung...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-apple-text-secondary before:float-left before:pointer-events-none before:h-0',
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-apple max-w-none focus:outline-none min-h-[300px] px-6 py-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="bg-apple-bg border border-apple-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-apple-blue/20 focus-within:border-apple-blue transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
