import { NextRequest, NextResponse } from 'next/server';
import { loadBookmarks, saveBookmarks, addBookmark, deleteBookmark, updateBookmark } from '@/lib/storage';
import { Bookmark } from '@/types/bookmark';
import { v4 as uuidv4 } from 'uuid';

// GET /api/bookmarks - Load all bookmarks
export async function GET() {
  try {
    const bookmarks = await loadBookmarks();
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to load bookmarks' },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Add a new bookmark
export async function POST(request: NextRequest) {
  try {
    const bookmarkData = await request.json();
    
    const bookmark: Bookmark = {
      id: uuidv4(),
      title: bookmarkData.title,
      url: bookmarkData.url,
      type: bookmarkData.type,
      thumbnail: bookmarkData.thumbnail,
      tags: bookmarkData.tags || [],
      description: bookmarkData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addBookmark(bookmark);
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to add bookmark' },
      { status: 500 }
    );
  }
}

// PUT /api/bookmarks - Update a bookmark
export async function PUT(request: NextRequest) {
  try {
    const bookmarkData = await request.json();
    
    if (!bookmarkData.id) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    await updateBookmark(bookmarkData.id, {
      title: bookmarkData.title,
      description: bookmarkData.description,
      tags: bookmarkData.tags,
      thumbnail: bookmarkData.thumbnail,
      updatedAt: new Date().toISOString()
    });

    // Return the updated bookmark
    const bookmarks = await loadBookmarks();
    const updatedBookmark = bookmarks.find(b => b.id === bookmarkData.id);
    
    if (!updatedBookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBookmark);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookmarks - Delete a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    await deleteBookmark(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
