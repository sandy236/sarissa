<?xml version="1.0" encoding="UTF-8"?>
<!-- 
 /**
 * ====================================================================
 * About
 * ====================================================================
 * All XSLT Minesweeper
 * @version @sarissa.version@
 * @author: Copyright Sean Whalen
 * ====================================================================
 * Licence
 * ====================================================================
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 or
 * the GNU Lesser General Public License version 2.1 as published by
 * the Free Software Foundation (your choice of the two).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License or GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * or GNU Lesser General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * or visit http://www.gnu.org
 *
 */
 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html"/>
	<xsl:template match="/">
		<xsl:call-template name="initReveal"/>
	</xsl:template>
	<xsl:template name="initReveal">
		<xsl:variable name="hClick" select="SweeperMap/click[last()]/@h"/>
		<xsl:variable name="vClick" select="SweeperMap/click[last()]/@v"/>
		<xsl:variable name="clicked" select="SweeperMap/square[@h=$hClick and @v=$vClick]"/>
		<xsl:call-template name="neighborsXY">
			<xsl:with-param name="alreadyRevealed" select="$clicked"/>
			<xsl:with-param name="recentSet" select="$clicked"/>
		</xsl:call-template>
	</xsl:template>
	<xsl:template name="neighborsXY">
		<xsl:param name="alreadyRevealed"/>
		<xsl:param name="recentSet"/>
		<xsl:variable name="zeros" select=" $recentSet[@nbc = 0 ]"/>
		<xsl:variable name="field" select="SweeperMap/square[(@isBomb != -1 and @isRevealed = 0 and
			not (@sqID = $alreadyRevealed/@sqID )) ]"/>
		<xsl:variable name="revealing" select="$field[              (       (concat(@h  -1 ,'/', @v
			) = $zeros/@sqID)             or (concat(@h  +1 ,'/', @v   ) = $zeros/@sqID)  or
			(concat(@h  -1 ,'/', @v -1) = $zeros/@sqID)  or (concat(@h  -1 ,'/', @v +1) =
			$zeros/@sqID)  or (concat(@h     ,'/', @v   ) = $zeros/@sqID)   or (concat(@h  +1 ,'/',
			@v +1) = $zeros/@sqID)  or (concat(@h  +1 ,'/', @v -1) = $zeros/@sqID)  or (concat(@h
			,'/', @v +1) = $zeros/@sqID)  or (concat(@h     ,'/', @v -1) = $zeros/@sqID)    )] "/>
		<xsl:variable name="totRevealed" select="$revealing | $alreadyRevealed"/>
		<xsl:choose>
			<xsl:when test="count($revealing[@nbc = 0 ] ) &gt; 0">
				<xsl:call-template name="neighborsXY">
					<xsl:with-param name="alreadyRevealed" select="$totRevealed "/>
					<xsl:with-param name="recentSet" select="$revealing"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:element name="SweeperMap">
					<xsl:for-each select="$totRevealed">
						<xsl:variable name="nbcColor">
							<xsl:choose>
								<xsl:when test="./@nbc = '0' ">#AA3344</xsl:when>
								<xsl:when test="./@nbc = '1' ">#0066FF</xsl:when>
								<xsl:when test="./@nbc = '2' ">#009900</xsl:when>
								<xsl:when test="./@nbc = '3' ">#FF0000</xsl:when>
								<xsl:when test="./@nbc = '4' ">#663399</xsl:when>
								<xsl:when test="./@nbc = '5' ">#ff8800</xsl:when>
								<xsl:when test="./@nbc = '6' ">#0088AA</xsl:when>
							</xsl:choose>
						</xsl:variable>
						<xsl:element name="square">
							<xsl:attribute name="h">
								<xsl:value-of select="./@h"/>
							</xsl:attribute>
							<xsl:attribute name="v">
								<xsl:value-of select="./@v"/>
							</xsl:attribute>
							<xsl:attribute name="isRevealed">1</xsl:attribute>
							<xsl:attribute name="nbc">
								<xsl:value-of select="./@nbc"/>
							</xsl:attribute>
							<xsl:attribute name="nbcColor">
								<xsl:value-of select="$nbcColor"/>
							</xsl:attribute>
						</xsl:element>
					</xsl:for-each>
				</xsl:element>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
