//"use client";

//import { useState, useEffect } from "react"; 
import Link from "next/link"
import Image from "next/image"

const getAllItems = async() => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/item/readall`, {cache: "no-store"})
    const jsonData = await response.json()
    const allItems = jsonData.allItems
    return allItems
}

const ReadAllItems = async() => {
    const allItems = await getAllItems()
//    const [allItems, setAllItems] = useState([]);
    return (
        <div className="grid-container-in">
            <title>hokkaido-gibier</title>     
            <meta name="description" content="hokkaido-gibier-app"/>
            {allItems.map(item => 
                <Link href={`/item/readsingle/${item._id}`} key={item._id}>
                    <Image src={item.image} width={750} height={500} alt="item-image" priority/>
                    <div key={item._id}> 
                        <h2>{item.price}</h2>
                        <h3>{item.title}</h3>
                        <p>{item.description.substring(0, 80)}...</p>  
                    </div>
                </Link>
            )}
        </div>
    )
} 

export default ReadAllItems